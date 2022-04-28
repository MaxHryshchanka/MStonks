import {LightningElement, api} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';

export default class HomeItem extends NavigationMixin(LightningElement) {
    @api item;

    get svgLink() {
        return '/assets/icons/utility-sprite/svg/symbols.svg#' + this.item.svg;
    }

    get pageReference() {
        return {
            type: 'standard__webPage',
            attributes: {
                url: basePath + this.item.url
            }
        };
    }

    handleNavigation() {
        this.dispatchEvent(new CustomEvent('navigation'));
    }

    handleClick(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        this.handleNavigation();
        this[NavigationMixin.Navigate](this.pageReference);
    }
}