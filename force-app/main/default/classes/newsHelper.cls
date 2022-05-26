public with sharing class newsHelper {
    private static final Integer MAX_LIMIT = 2000;

    @AuraEnabled(Cacheable=true)
    public static List<News__b> getNews(Integer lim) {
        List<News__b> news = new List<News__b>();

        if (lim > MAX_LIMIT) {
            lim = MAX_LIMIT;
        }

        for (News__b n : [
                SELECT Title__c, Description__c, Author__c, Link__c, ImageLink__c, Created__c
                FROM News__b
                LIMIT :lim
        ]) {
            news.add(n);
        }

        return news;
    }
}