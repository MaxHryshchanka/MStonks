public class indexHelper {
    @AuraEnabled(cacheable=true)
    public static Map<String, String> getIndexes(String stockId) {
        Map<String, String> results = new Map<String, String>();

        List<Timeseries__b> timeseries = new List<Timeseries__b>();
        for (Timeseries__b t : [
                SELECT Moment__c, High__c, Close__c, Open__c, Low__c, Volume__c
                FROM Timeseries__b
                WHERE Stock__c = :stockId AND Interval__c = '1day'
                LIMIT 51
        ]) {
            timeseries.add(t);
        }

        if (timeseries.size() == 51) {
            List<Double> highList = new List<Double>();
            List<Double> lowList = new List<Double>();
            List<Double> priceList = new List<Double>();

            for () {

            }

        }

        return results;
    }



    public static Double EMA(List<Double> priceList, Integer n, Double smoothing, Double lastEMA) {
        Double result = lastEMA;

        for (Double price : priceList) {
            result = (price * (smoothing / (1 + n)) + result * (1 - (smoothing / (1 + n))));
        }

        return result;
    }

    public static Double SMA(List<Double> priceList, Integer n) {
        Double result = 0;

        for (Double price : priceList) {
            result += price;
        }

        return result / n;
    }

    public static Double RSI(List<Double> priceList) {
        List<Double> upList = new List<Double>();
        List<Double> downList = new List<Double>();

        for (Integer i = 1; i < priceList.size(); i++) {
            Double c = priceList[i] - priceList[i-1];
            if (c > 0) {
                upList.add(c);
                downList.add(0);
            }
            else if (c < 0) {
                upList.add(0);
                downList.add(Math.abs(c));
            }
            else {
                upList.add(0);
                downList.add(0);
            }
        }

        return 100 - 100 / (1 + indexHelper.EMA(upList, 14, 2, priceList[0]) / indexHelper.EMA(downList, 14, 2, priceList[0]));
    }

    public static Double RSI(List<Double> priceList, Integer n) {
        List<Double> upList = new List<Double>();
        List<Double> downList = new List<Double>();

        for (Integer i = 1; i < priceList.size(); i++) {
            Double c = priceList[i] - priceList[i-1];
            if (c > 0) {
                upList.add(c);
                downList.add(0);
            }
            else if (c < 0) {
                upList.add(0);
                downList.add(Math.abs(c));
            }
            else {
                upList.add(0);
                downList.add(0);
            }
        }

        return 100 - 100 / (1 + indexHelper.EMA(upList, n, 2, priceList[0]) / indexHelper.EMA(downList, n, 2, priceList[0]));
    }

    public static Double R(List<Double> highPrice, List<Double> lowPrice, Double price) {
        Double maxPrice = price;
        for (Double num : highPrice) {
            if (maxPrice < num) {
                maxPrice = num;
            }
        }

        Double minPrice = price;
        for (Double num : lowPrice) {
            if (minPrice > num) {
                minPrice = num;
            }
        }

        return (maxPrice - price) / (maxPrice - minPrice) * -100;
    }

    public static Double STOC(List<Double> highPrice, List<Double> lowPrice, Double price) {
        Double maxPrice = price;
        for (Double num : highPrice) {
            if (maxPrice < num) {
                maxPrice = num;
            }
        }

        Double minPrice = price;
        for (Double num : lowPrice) {
            if (minPrice > num) {
                minPrice = num;
            }
        }

        return (price - minPrice) / (maxPrice - minPrice) * 100;
    }
}