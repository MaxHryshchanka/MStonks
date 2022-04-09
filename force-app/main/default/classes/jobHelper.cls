public with sharing class jobHelper {
    private static String NAME_NEWS_JOB = 'Daily News Update';
    private static String CRON_NEWS_JOB = '0 0 13 * * ?';

    public static void startNewsJobs() {
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