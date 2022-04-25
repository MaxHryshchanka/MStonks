import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

import getNavigationMenuItems from '@salesforce/apex/NavigationMenuItemsController.getNavigationMenuItems';
import isGuestUser from '@salesforce/user/isGuest';

export default class navigationMenu extends LightningElement {
    @api menuName;
    @track menuItems = [];
    @track isLoaded = false;
    @track error;

    isInitialized = false;
    lastScrollTop = 0;
    publishedState;


    @wire(getNavigationMenuItems, {
        menuName: '$menuName',
        publishedState: '$publishedState'
    })
    wiredMenuItems({error, data}) {
        if (data && !this.isLoaded) {
            this.menuItems = data.map((item, index) => {
                return {
                    target: item.Target,
                    id: index,
                    label: item.Label,
                    defaultListViewId: item.DefaultListViewId,
                    type: item.Type,
                    accessRestriction: item.AccessRestriction
                }
            }).filter(item => {
                // Only show "Public" items if guest user
                return item.accessRestriction === "None"
                    || (item.accessRestriction === "LoginRequired" && !isGuestUser);
            });
            this.error = undefined;
            this.isLoaded = true;
        } else if (error) {
            this.error = error;
            this.menuItems = [];
            this.isLoaded = true;
            console.log(`Navigation menu error: ${JSON.stringify(this.error)}`);
        }
    }

    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        const app = currentPageReference && currentPageReference.state && currentPageReference.state.app;
        if (app === 'commeditor') {
            this.publishedState = 'Draft';
        } else {
            this.publishedState = 'Live';
        }
    }

    renderedCallback() {
        if (!this.isInitialized) {
            this.isInitialized = true;
            window.addEventListener('scroll', event => {
                this.handleScroll(event);
            });
        }
    }

    handleScroll(event) {
        let scrollTop = window.pageYOffset || event.target.scrollTop;
        if (scrollTop > this.lastScrollTop) {
            this.template.querySelector('.header').classList.add('scroll_up')
        }
        else {
            this.template.querySelector('.header').classList.remove('scroll_up')
        }
        this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }
}