import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';

export default class NavigationMenuItem extends NavigationMixin(LightningElement) {
    @api item = {};
    @track href = '#';
    pageReference;

    connectedCallback() {
        const { type, target, defaultListViewId } = this.item;
        if (type === 'SalesforceObject') {
            // aka "Salesforce Object" menu item
            this.pageReference = {
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: target
                },
                state: {
                    filterName: defaultListViewId
                }
            };
        } else if (type === 'InternalLink') {
            // aka "Site Page" menu item
            this.pageReference = {
                type: 'standard__webPage',
                attributes: {
                    url: basePath + target
                }
            };
        } else if (type === 'ExternalLink') {
            // aka "External URL" menu item
            this.pageReference = {
                type: 'standard__webPage',
                attributes: {
                    url: target
                }
            };
        }

        // use the NavigationMixin from lightning/navigation to generate the URL for navigation.
        if (this.pageReference) {
            this[NavigationMixin.GenerateUrl](this.pageReference).then(
                (url) => {
                    this.href = url;
                }
            );
        }
    }

    handleNavigation() {
        this.dispatchEvent(new CustomEvent('navigation'));
    }

    handleClick(evt) {
        // use the NavigationMixin from lightning/navigation to perform the navigation.
        evt.stopPropagation();
        evt.preventDefault();
        this.handleNavigation();
        if (this.pageReference) {
            this[NavigationMixin.Navigate](this.pageReference);
        }
        else {
            console.log(`Navigation menu type "${this.item.type}" not implemented for item ${JSON.stringify(this.item)}`);
        }
    }
}