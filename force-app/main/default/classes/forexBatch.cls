public class forexBatch implements Database.Batchable<String>, Database.AllowsCallouts, Database.Stateful  {
    private final String NAME_TWELVE_API = 'Twelve';

    public final List<String> forexNames;
    public final String jobName;
    public final Integer scopeSize;

    public forexBatch(List<String> names, String jobName, Integer scopeSize) {
        this.forexNames = names;
        this.jobName = jobName;
        this.scopeSize = scopeSize;
    }

    public Iterable<String> start(Database.BatchableContext BC) {
        List<String> names = new List<String>();
        Integer size = forexNames.size();

        for (Integer i = 0; i < size && i < scopeSize; i++) {
            names.add(forexNames.remove(0));
        }

        return names;
    }

    public void execute(Database.BatchableContext BC, List<String> names) {
        List<Forex__c> forexList = new List<Forex__c>();
        String apiKey = requestHelper.getApiKey(NAME_TWELVE_API);

        Map<String, String> nameToIdsMap = getNameToIdsMap(names);

        for(String name : names) {
            Forex__c forex = requestHelper.requestForex(apiKey, name);
            forex.Id = nameToIdsMap.get(name);
            forexList.add(forex);
        }

        upsert(forexList);
    }

    public void finish(Database.BatchableContext BC) {
        if (!forexNames.isEmpty()) {
            forexBatch batch = new forexBatch(forexNames, jobName, scopeSize);
            System.scheduleBatch(batch, jobName, 1, scopeSize);
        }
    }

    private Map<String, String> getNameToIdsMap(List<String> names) {
        Map<String, String> nameToIdsMap = new Map<String, String>();

        for (String name : names) {
            nameToIdsMap.put(name, null);
        }

        for (Forex__c s : [
                SELECT Id, Name
                FROM Forex__c
                WHERE Name IN :names
        ]) {
            nameToIdsMap.put(s.Name, s.Id);
        }

        return nameToIdsMap;
    }
}