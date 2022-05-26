import {LightningElement, track, wire} from 'lwc';
import getNews from '@salesforce/apex/newsHelper.getNews';

const HEADER_NEWS_COUNTER = 5;
const NEWS_LIMIT = 10;
const NEWS_ADD_LIMIT = 10;

export default class NewsContainer extends LightningElement {
    @track headNews;
    @track bodyNews;

    loaded = false;
    isLoadingNew = false;
    isAllNews = false;

    limit = NEWS_LIMIT;
    counter;

    @wire(getNews, { lim: '$limit'})
    wiredNews({error, data}) {
        if (data) {
            if (this.headNews === undefined && data.length !== 0) {
                this.headNews = this.getNewsArray(data.slice(0, HEADER_NEWS_COUNTER))
            }

            if (data.length >= HEADER_NEWS_COUNTER) {
                this.bodyNews = this.getNewsArray(data.slice(HEADER_NEWS_COUNTER, data.length))
            }

            if (this.counter == data.length) {
                this.isAllNews = true;
            }
            else {
                this.counter = data.length;
            }

            this.loaded = true;
            this.isLoadingNew = false;
        }
        else {
            console.log(error);
        }

    };

    handleLoad() {
        this.isLoadingNew = true;
        this.limit += NEWS_ADD_LIMIT;
    }

    toNewsObject(el) {
        return {
            Author: el['Author__c'],
            Title: el['Title__c'],
            Description: el['Description__c'],
            Url: el['Link__c'],
            Image: el['ImageLink__c'],
            ShortPublishedAt: this.getShortDate(el['Created__c']),
            FullPublishedAt: this.getFullDate(el['Created__c'])
        }
    }

    getNewsArray(data) {
        return data.map((el) => this.toNewsObject(el));
    }

    getShortDate(strDateTime) {
        // 2022-04-06T16:32:05.000Z -> 06 Apr 2022
        let strDates = new Date(strDateTime).toUTCString().split(' ').slice(1, 4);
        return strDates.join(' ');
    }

    getFullDate(strDateTime) {
        // 2022-04-06T16:32:05.000Z -> 06 Apr 2022, 16:32
        let strDates = new Date(strDateTime).toUTCString().split(' ').slice(1, 5);
        return strDates.slice(0, 3).join(' ') + ', ' + strDates[3].split(':').slice(0, 2).join(':')
    }
}
