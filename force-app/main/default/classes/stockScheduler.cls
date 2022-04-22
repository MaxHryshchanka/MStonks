public class stockScheduler implements Schedulable {
    private final Integer SCOPE_SIZE = 4;
    private final String JOB_NAME = 'Batch Stocks Update';
    private final List<String> STOCK_NAMES = new List<String>{
            'AAPL', 'MSFT', 'AMZN', 'TSLA', 'NVDA'
    };

    public void execute(SchedulableContext SC) {
        stockBatch batch = new stockBatch(STOCK_NAMES, JOB_NAME, SCOPE_SIZE);
        System.scheduleBatch(batch, JOB_NAME, 1, SCOPE_SIZE);
    }
}