public class stockWrapper {
    /**
     * Quote callout fields
     */
    public String name;
    public String exchange;
    // currency -> currency_code
    public String currency_code;
    public String open;
    public String low;
    public String high;
    public String close;
    public String previous_close;
    public String volume;
    public String average_volume;
    public String change;
    public String percent_change;
    public Weeks fifty_two_week;

    public class Weeks {
        public String range;
    }

    /**
     * Logo callout fields
     */
    // url -> url_logo
    public String url_logo;
}