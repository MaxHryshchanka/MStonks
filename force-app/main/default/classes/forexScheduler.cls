public class forexScheduler implements Schedulable {
    private final Integer SCOPE_SIZE = 8;
    private final String JOB_NAME = 'Batch Forex Update';
    private final List<String> FOREX_NAMES = new List<String>{
            'BTC/USD',
            'ETH/USD',
            'EUR/USD',
            'XPT/USD',
            'USD/RUB'
    };

    public void execute(SchedulableContext SC) {
        forexBatch batch = new forexBatch(FOREX_NAMES, JOB_NAME, SCOPE_SIZE);
        System.scheduleBatch(batch, JOB_NAME, 1, SCOPE_SIZE);
    }
}