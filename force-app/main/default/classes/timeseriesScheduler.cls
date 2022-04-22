public class timeseriesScheduler implements Schedulable {
    private final Integer SCOPE_SIZE = 2;
    private final String JOB_NAME = 'Batch Timeseries Update';

    public void execute(SchedulableContext SC) {
        timeseriesBatch batch = new timeseriesBatch(getStockIds(), JOB_NAME, SCOPE_SIZE);
        System.scheduleBatch(batch, JOB_NAME, 1, SCOPE_SIZE);
    }

    private List<String> getStockIds() {
        List<String> stockIds = new List<String>();

        for (Stock__c s : [
                SELECT Id
                FROM Stock__c
        ]) {
            stockIds.add(s.Id);
        }

        return stockIds;
    }
}