public with sharing class requestHelper {
    private static String HTTP_GET = 'GET';
    private static String END_APIKEY = '&apikey=';

    private static String DEFAULT_URL_LOGO = 'https://logo.twelvedata.com/forex/usd.png';
    private static String END_QUOTE_TWELVE_API = 'https://api.twelvedata.com/quote?symbol=';
    private static String END_LOGO_TWELVE_API = 'https://api.twelvedata.com/logo?symbol=';

    private static String END_INTERVAL = '&interval=';
    private static String END_OUTPUTSIZE = '&outputsize=100';
    private static String END_TIMESERIES_TWELVE_API = 'https://api.twelvedata.com/time_series?symbol=';
    private static List<String> TIMESERIES_INTERVALS = new List<String>{ '1day', '1week', '1month' };

    private static String NAME_NEWS_API = 'News';
    private static String END_NEWS_API = 'https://newsapi.org/v2/top-headlines?sources=the-wall-street-journal';

    public static Stock__c requestQuote(String apiKey, String stockName) {
        Stock__c quote = new Stock__c();

        if (apiKey != null) {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setMethod(HTTP_GET);
            request.setEndpoint(END_QUOTE_TWELVE_API + stockName + END_APIKEY + apiKey);
            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 200) {
                String jsonString = response.getBody().replace('currency', 'currency_code');
                stockWrapper jsonResult = (stockWrapper) JSON.deserialize(jsonString, stockWrapper.class);

                quote.Name = stockName;
                quote.Company_Name__c = jsonResult.name;
                quote.Exchange__c = jsonResult.exchange;
                quote.Currency_Code__c = jsonResult.currency_code;
                quote.Open__c = Decimal.valueOf(jsonResult.open);
                quote.Close__c = Decimal.valueOf(jsonResult.close);
                quote.Close_Previous__c = Decimal.valueOf(jsonResult.previous_close);
                quote.Volume__c = Decimal.valueOf(jsonResult.volume);
                quote.Volume_Average__c = Decimal.valueOf(jsonResult.average_volume);
                quote.Change__c = Decimal.valueOf(jsonResult.change);
                quote.Change_Percent__c = Decimal.valueOf(jsonResult.percent_change);
                quote.Weeks_Range__c = jsonResult.fifty_two_week.range;
                quote.Day_Range__c = jsonResult.low + ' - ' + jsonResult.high;
            }
        }

        return quote;
    }

    public static String requestLogo(String apiKey, String stockName) {
        String urlLogo = DEFAULT_URL_LOGO;

        if (apiKey != null) {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setMethod(HTTP_GET);
            request.setEndpoint(END_LOGO_TWELVE_API + stockName + END_APIKEY + apiKey);
            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 200) {
                String jsonString = response.getBody().replace('url', 'url_logo');
                stockWrapper jsonResult = (stockWrapper) JSON.deserialize(jsonString, stockWrapper.class);
                urlLogo = jsonResult.url_logo;
            }
        }

        return urlLogo;
    }

    public static List<Timeseries__b> requestTimeSeries(String apiKey, String stockId, String stockName) {
        List<Timeseries__b> timeseries = new List<Timeseries__b>();

        if (apiKey != null) {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setMethod(HTTP_GET);

            for (String interval : TIMESERIES_INTERVALS) {
                request.setEndpoint(END_TIMESERIES_TWELVE_API + stockName + END_INTERVAL + interval + + END_OUTPUTSIZE + END_APIKEY + apiKey);
                System.debug(END_TIMESERIES_TWELVE_API + stockName + END_INTERVAL + interval + END_APIKEY + apiKey);
                HttpResponse response = http.send(request);

                if (response.getStatusCode() == 200) {
                    String jsonString = response.getBody().replace('datetime', 'moment');
                    timeseriesWrapper jsonResult = (timeseriesWrapper) JSON.deserialize(jsonString, timeseriesWrapper.class);

                    for (timeseriesWrapper.Series series : jsonResult.values) {
                        timeseries.add(new Timeseries__b(
                                Interval__c = interval,
                                Stock__c = stockId,
                                High__c = Decimal.valueOf(series.high),
                                Close__c = Decimal.valueOf(series.close),
                                Open__c = Decimal.valueOf(series.open),
                                Low__c = Decimal.valueOf(series.low),
                                Volume__c = Decimal.valueOf(series.volume),
                                Moment__c = Date.valueOf(series.moment)
                        ));
                    }
                }
            }
        }

        return timeseries;
    }

    @Future(Callout=true)
    public static void requestNews() {
        List<News__b> news = new List<News__b>();
        String apiKey = getApiKey(NAME_NEWS_API);

        if (apiKey != null) {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setMethod(HTTP_GET);
            request.setEndpoint(END_NEWS_API + END_APIKEY + apiKey);
            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 200) {
                newsWrapper jsonResult = (newsWrapper) JSON.deserialize(response.getBody(), newsWrapper.class);

                for (newsWrapper.News n : jsonResult.articles) {
                    news.add(new News__b(
                            Author__c = n.author,
                            Title__c = n.title,
                            Description__c = n.description,
                            Link__c = n.url,
                            ImageLink__c = n.urlToImage,
                            Created__c = stringToDatetime(n.publishedAt)
                    ));
                }
            }
        }

        Database.insertImmediate(news);
    }

    public static Forex__c requestForex(String apiKey, String forexName) {
        Forex__c forex = new Forex__c();

        if (apiKey != null) {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setMethod(HTTP_GET);
            request.setEndpoint(END_QUOTE_TWELVE_API + forexName + END_APIKEY + apiKey);
            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 200) {
                forexWrapper jsonResult = (forexWrapper) JSON.deserialize(response.getBody(), forexWrapper.class);

                forex.Name = forexName;
                forex.Close__c = Decimal.valueOf(jsonResult.close);
                forex.Change_Percent__c = Decimal.valueOf(jsonResult.percent_change);
            }
        }

        return forex;
    }

    public static String getApiKey(String name) {
        for (Api_Settings__c s : [
                SELECT Key__c
                FROM Api_Settings__c
                WHERE Name = :name
        ]) {
            return s.Key__c;
        }
        return null;
    }

    private static Datetime stringToDatetime(String strDatetime) {
        // '2022-04-06T16:32:05Z'
        List<String> strParts = strDatetime.substring(0, strDatetime.length() - 1).split('T');
        List<String> strDates = strParts[0].split('-');
        List<String> strTimes = strParts[1].split(':');

        return Datetime.newInstanceGMT(
                Integer.valueOf(strDates[0]),
                Integer.valueOf(strDates[1]),
                Integer.valueOf(strDates[2]),
                Integer.valueOf(strTimes[0]),
                Integer.valueOf(strTimes[1]),
                Integer.valueOf(strTimes[2])
        );
    }
}