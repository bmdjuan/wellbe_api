/**
 * Created by bmartin on 17/04/15.
 */
var TimeStamp = modelBuilder.define('createdTS', {created: Date, modified: Date});
WbUser.mixin(TimeStamp);
