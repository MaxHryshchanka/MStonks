import {LightningElement} from 'lwc';
import {NavigationMixin} from "lightning/navigation";
import basePath from "@salesforce/community/basePath";

export default class HomeContainer extends NavigationMixin(LightningElement) {
    get items() {
        return [
            {
                title: 'Stocks & Quotes',
                description: 'Get the latest stock information & quotes, data analysis, as well as a general overview of the market landscape from Nasdaq.',
                svg: 'utility:trending',
                url: '/portfolio'
            },
            {
                title: 'News & Tips',
                description: 'Find the up-to-date breaking news and information on the top business, investments, politics, and more.',
                svg: 'utility:news',
                url: '/news'
            },
            {
                title: 'Calculators & Tools',
                description: 'Use technical analysis tools that can help you achieve your financial goals.',
                svg: 'utility:custom_apps',
                url: '/tools'
            },
        ]
    }

    get pageReference() {
        return {
            type: 'standard__webPage',
            attributes: {
                url: basePath + '/SelfRegister'
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