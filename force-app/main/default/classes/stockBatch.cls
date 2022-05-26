public class stockBatch implements Database.Batchable<String>, Database.AllowsCallouts, Database.Stateful {
    private final String NAME_TWELVE_API = 'Twelve';

    public final List<String> stockNames;
    public final String jobName;
    public final Integer scopeSize;

    public stockBatch(List<String> names, String jobName, Integer scopeSize) {
        this.stockNames = names;
        this.jobName = jobName;
        this.scopeSize = scopeSize;
    }

    public Iterable<String> start(Database.BatchableContext BC) {
        List<String> names = new List<String>();
        Integer size = stockNames.size();

        for (Integer i = 0; i < size && i < scopeSize; i++) {
            names.add(stockNames.remove(0));
        }

        return names;
    }

    public void execute(Database.BatchableContext BC, List<String> names) {
        List<Stock__c> stocks = new List<Stock__c>();
        String apiKey = requestHelper.getApiKey(NAME_TWELVE_API);

        Map<String, String> nameToIdsMap = getNameToIdsMap(names);

        for(String name : names) {
            Stock__c quote = requestHelper.requestQuote(apiKey, name);
            quote.Logo__c = requestHelper.requestLogo(apiKey, name);
            quote.Id = nameToIdsMap.get(name);

            stocks.add(quote);
        }

        upsert(stocks);
    }

    public void finish(Database.BatchableContext BC) {
        if (!stockNames.isEmpty()) {
            stockBatch batch = new stockBatch(stockNames, jobName, scopeSize);
            System.scheduleBatch(batch, jobName, 1, scopeSize);
        }
    }

    private Map<String, String> getNameToIdsMap(List<String> names) {
        Map<String, String> nameToIdsMap = new Map<String, String>();

        for (String name : names) {
            nameToIdsMap.put(name, null);
        }

        for (Stock__c s : [
                SELECT Id, Name
                FROM Stock__c
                WHERE Name IN :names
        ]) {
            nameToIdsMap.put(s.Name, s.Id);
        }

        return nameToIdsMap;
    }
}