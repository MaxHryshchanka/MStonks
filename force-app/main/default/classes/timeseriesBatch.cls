public class timeseriesBatch implements Database.Batchable<String>, Database.AllowsCallouts, Database.Stateful {
    private final String NAME_TWELVE_API = 'Twelve';

    public final List<String> stockIds;
    public final String jobName;
    public final Integer scopeSize;

    public timeseriesBatch(List<String> stockIds, String jobName, Integer scopeSize) {
        this.stockIds = stockIds;
        this.jobName = jobName;
        this.scopeSize = scopeSize;
    }

    public Iterable<String> start(Database.BatchableContext BC) {
        List<String> ids = new List<String>();
        Integer size = stockIds.size();

        for (Integer i = 0; i < size && i < scopeSize; i++) {
            ids.add(stockIds.remove(0));
        }

        return ids;
    }

    public void execute(Database.BatchableContext BC, List<String> stockIds) {
        List<Timeseries__b> newTimeseries = new List<Timeseries__b>();
        List<Timeseries__b> oldTimeseries = new List<Timeseries__b>();

        Map<String, String> idToNamesMap = getIdToNamesMap(stockIds);

        String apiKey = requestHelper.getApiKey(NAME_TWELVE_API);

        for (String id : stockIds) {
            newTimeseries.addAll(requestHelper.requestTimeSeries(apiKey, id, idToNamesMap.get(id)));
        }

        oldTimeseries.addAll(getTimeseries(stockIds));

        Database.deleteImmediate(oldTimeseries);
        Database.insertImmediate(newTimeseries);
    }

    public void finish(Database.BatchableContext BC) {
        if (!stockIds.isEmpty()) {
            timeseriesBatch batch = new timeseriesBatch(stockIds, jobName, scopeSize);
            System.scheduleBatch(batch, jobName, 1, scopeSize);
        }
    }

    private Map<String, String> getIdToNamesMap(List<String> stockIds) {
        Map<String, String> idToNamesMap = new Map<String, String>();

        for(Stock__c s : [
                SELECT Id, Name
                FROM Stock__c
                WHERE Id IN :stockIds
        ]) {
            idToNamesMap.put(s.Id, s.Name);
        }

        return idToNamesMap;
    }

    private List<Timeseries__b> getTimeseries(List<String> stockIds) {
        List<Timeseries__b> timeseries = new List<Timeseries__b>();

        for(Timeseries__b t : [
                SELECT Stock__c, Interval__c, Moment__c
                FROM Timeseries__b
                WHERE Stock__c = :stockIds
        ]) {
            timeseries.add(t);
        }

        return timeseries;
    }
}