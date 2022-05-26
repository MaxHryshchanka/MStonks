public with sharing class forexHelper {
    @AuraEnabled(Cacheable=true)
    public static List<Forex__c> getForex() {
        List<Forex__c> forexList = new List<Forex__c>();

        for (Forex__c f : [
                SELECT Name, Close__c, Change_Percent__c
                FROM Forex__c
                LIMIT 5
        ]) {
            f.Close__c = f.Close__c.setScale(2);
            f.Change_Percent__c = f.Change_Percent__c.setScale(2);

            forexList.add(f);
        }

        return forexList;
    }
}