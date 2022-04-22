public with sharing class jobHelper {
    private static String NAME_STOCK_JOB = 'Daily Stocks Update';
    private static String CRON_STOCK_JOB = '0 0 12 * * ?';
    private static String NAME_TIMESERIES_JOB = 'Daily Timeseries Update';
    private static String CRON_TIMESERIES_JOB = '0 0 13 * * ?';
    private static String NAME_NEWS_JOB = 'Daily News Update';
    private static String CRON_NEWS_JOB = '0 0 14 * * ?';

    public static void runJobs() {
        startStockJob();
        startTimeseriesJob();
        startNewsJob();
    }

    private static void startStockJob() {
        if (!checkIsJobRunning(NAME_STOCK_JOB)) {
            stockScheduler ss = new stockScheduler();
            String jobID = System.schedule(NAME_STOCK_JOB, CRON_STOCK_JOB, ss);
        }
    }

    private static void startTimeseriesJob() {
        if (!checkIsJobRunning(NAME_TIMESERIES_JOB)) {
            timeseriesScheduler ts = new timeseriesScheduler();
            String jobID = System.schedule(NAME_TIMESERIES_JOB, CRON_TIMESERIES_JOB, ts);
        }
    }

    private static void startNewsJob() {
        if (!checkIsJobRunning(NAME_NEWS_JOB)) {
            newsScheduler ns = new newsScheduler();
            String jobID = System.schedule(NAME_NEWS_JOB, CRON_NEWS_JOB, ns);
        }
    }

    private static Boolean checkIsJobRunning(String jobName) {
        for (CronTrigger ct : [
                SELECT Id
                FROM CronTrigger
                WHERE CronJobDetail.Name = :jobName
        ]) {
            return true;
        }

        return false;
    }
}