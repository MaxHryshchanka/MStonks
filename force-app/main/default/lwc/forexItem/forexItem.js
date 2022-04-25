import {LightningElement, api} from 'lwc';

export default class ForexItem extends LightningElement {
    @api forex;

    get ifForexPositive() {
        return Math.sign(this.forex.Change_Percent__c) >= 0
    }

    get forexChangePercent() {
        return this.ifForexPositive
            ? '+' + this.forex.Change_Percent__c + '%'
            : this.forex.Change_Percent__c + '%';
    }

    get forexClose() {
        return '(' + this.forex.Close__c + ')';
    }
}