public without sharing class timeseriesHelper {
    @AuraEnabled(cacheable=true)
    public static List<Timeseries__b> getPortfolioTimeseries(String stockId, String interval) {
        List<Timeseries__b> timeseries = new List<Timeseries__b>();

        for (Timeseries__b t : [
                SELECT Moment__c, High__c, Close__c, Open__c, Low__c, Volume__c
                FROM Timeseries__b
                WHERE Stock__c = :stockId AND Interval__c = :interval
                LIMIT 100
        ]) {
            timeseries.add(t);
        }

        return timeseries;
    }
}