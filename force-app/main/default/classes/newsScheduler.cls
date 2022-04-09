public class newsScheduler implements Schedulable {
    public void execute(SchedulableContext SC) {
        requestHelper.requestNews();
    }
}