global with sharing class navigationMenuItemsController {
    public navigationMenuItemsController() { }

    @AuraEnabled(cacheable=true)
    public static List<NavigationMenuItem> getNavigationMenuItems(String menuName, String publishedState) {
        if (String.isEmpty(menuName)) {
            return new List<NavigationMenuItem>();
        }

        String networkId = Network.getNetworkId();

        List<NavigationLinkSet> linkSets = [
                SELECT Id
                FROM NavigationLinkSet
                WHERE DeveloperName = :menuName AND NetworkId = :networkId
        ];

        Id linkSetId = linkSets.get(0).Id;

        List<NavigationMenuItem> navigationMenuItems = new List<NavigationMenuItem>();

        for (NavigationMenuItem item : [
                SELECT
                        Label,
                        Target,
                        Type,
                        DefaultListViewId,
                        AccessRestriction,
                        ParentId,
                        Position,
                        Status,
                        TargetPrefs
                FROM NavigationMenuItem
                WHERE NavigationLinkSetId = :linkSetId AND Status = :publishedState
                ORDER BY Position
        ]) {
            navigationMenuItems.add(item);
        }

        return navigationMenuItems;
    }
}