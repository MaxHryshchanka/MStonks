public with sharing class requestHelper {
    private static String HTTP_GET = 'GET';

    private static String NAME_NEWS_API = 'News';
    private static String END_NEWS_API = 'https://newsapi.org/v2/top-headlines?sources=the-wall-street-journal&apiKey=';

    @Future(Callout=true)
    public static void requestNews() {
        List<News__b> news = new List<News__b>();
        String apiKey = getApiKey(NAME_NEWS_API);

        if (apiKey != null) {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setMethod(HTTP_GET);
            request.setEndpoint(END_NEWS_API + apiKey);
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

    private static String getApiKey(String name) {
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