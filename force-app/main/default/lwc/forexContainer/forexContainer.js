import {LightningElement, wire,track} from 'lwc';
import getForex from '@salesforce/apex/forexHelper.getForex';

export default class ForexContainer extends LightningElement {
    @track forexItems;
    isLoaded = false;

    @wire(getForex)
    wiredForex({ error, data }) {
        if (data) {
            this.forexItems = data;
            this.isLoaded = true;
        } else if (error) {
            console.log(error);
        }
    }
}