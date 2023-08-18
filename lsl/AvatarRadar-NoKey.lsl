///////////////////////////////////
//AvatarRadar by Real Burger
///////////////////////////////////

string greeter_message = "Welcome _name_!";
string farewell_message = "Adios _name_...";
string visitors_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:*****/visitors";
string visit_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:*****/visits";
float range = 20;

list ignoredResidents = ["c1cffbe5-d5ea-4fc7-b2b3-327f77a0cf9a",//amore bellios
"381cfe40-8d58-4e6a-afb7-44bad59e3d8b",//real burger
"dec7c661-6567-4178-889e-77fed474f937"//staliah
];

integer channel;
integer configState;
list mobKeys;
list mobGreeted;
list mobVisitId;
list mobAway;

integer is_operating = FALSE;// Trigger to avoid lag with long list

integer SECRET_NUMBER=123456789;
string SECRET_STRING="abcdefghi";

key born_query;
key http_request_visitor;
key http_request_visit;
key http_request_visit_left;

string strReplace(string source, string pattern, string replace) {
    while (llSubStringIndex(source, pattern) > -1) {
        integer len = llStringLength(pattern);
        integer pos = llSubStringIndex(source, pattern);
        if (llStringLength(source) == len) {
            source = replace;
        } else if (pos == 0) {
            source = replace + llGetSubString(source, pos + len, -1);
        } else if (pos == llStringLength(source) - len) {
            source = llGetSubString(source, 0, pos - 1) + replace;
        } else {
            source = llGetSubString(source, 0, pos - 1) + replace + llGetSubString(source, pos + len, -1);
        }
    }
    return source;
}

string getDisplayNameIfPossible(key k) {
    string result = llGetDisplayName(k);
    if (result == "") {
        result = llKey2Name(k);
    }
    return result;
}

string left(string src, string divider) {
    integer index = llSubStringIndex(src, divider);
    if (~index)
        return llDeleteSubString(src, index, -1);
    return src;
}

greet (key avatar) {
    // string message = strReplace(greeter_message, "_name_", getDisplayNameIfPossible(avatar));
    // llSay(0, message);
    // born_query = llRequestAgentData(avatar, DATA_BORN);
    http_request_visitor = xrequest(visitors_api_url, ["username", llKey2Name(avatar), "displayname", getDisplayNameIfPossible(avatar)]);
}

farewell (key avatar) {
    string message = strReplace(farewell_message, "_name_", getDisplayNameIfPossible(avatar));
    llSay(0, message);
}

key xrequest(string url, list l)
{
    integer i;
    string body;
    integer len=llGetListLength(l) & 0xFFFE; // make it even
    for (i=0;i<len;i+=2)
    {
        string varname=llList2String(l,i);
        string varvalue=llList2String(l,i + 1);
        if (i>0) body+="&";
        body+=llEscapeURL(varname)+"="+llEscapeURL(varvalue);
    }
    string hash=llMD5String(body+llEscapeURL(SECRET_STRING),SECRET_NUMBER);
    return llHTTPRequest(url+"?hash="+hash,[HTTP_METHOD,"POST",HTTP_MIMETYPE,"application/x-www-form-urlencoded"],body);
}

default {
    state_entry() {
        llSetTimerEvent(5);
    }

    timer() {
        if (is_operating == FALSE){
            
            is_operating = TRUE; // trigger start of opeartion
            
            list keys;
            if (range == -1) {
                keys = llGetAgentList(AGENT_LIST_REGION, []);
            } else {
                keys = llGetAgentList(AGENT_LIST_PARCEL, []);
            }
            integer numberOfKeys = llGetListLength(keys);
            vector currentPos = llGetPos();
            integer i;
            for (i = 0; i < numberOfKeys; i++) {
                key thisKey = llList2Key(keys, i);

                string thisKeyStr = thisKey;
                if (llListFindList(ignoredResidents, (list)thisKeyStr) == -1) {

                    integer posInList = llListFindList(mobKeys, (list)thisKey);
                    if (posInList == -1) { // is not in mobKeys

                        mobKeys += thisKey;
                        mobAway += FALSE;

                        if ((range == -1)||(llVecDist(currentPos, llList2Vector(llGetObjectDetails(thisKey, [OBJECT_POS]), 0)) <= range)) {
                            mobGreeted += TRUE;
                            greet(thisKey);
                        } else {
                            mobGreeted += FALSE;
                        }
                    } else { // if in mobKeys, but not greeted
                        if (llList2Integer(mobGreeted, posInList) == FALSE) {
                            if ((range == -1)||(llVecDist(currentPos, llList2Vector(llGetObjectDetails(thisKey, [OBJECT_POS]), 0)) <= range)) {
                                mobGreeted = llListReplaceList(mobGreeted, [TRUE], posInList, posInList);
                                greet(thisKey);
                            }
                        } else if (llList2Integer(mobAway, posInList) == TRUE) {
                            mobAway = llListReplaceList(mobAway, [FALSE], posInList, posInList);
                        }
                    }
                }
            }
            for (i = 0; i < llGetListLength(mobAway); i++) {
                if (llList2Integer(mobAway, i) == FALSE) {
                    if (llListFindList(keys, llList2List(mobKeys, i, i)) == -1) {
                        mobAway = llListReplaceList(mobAway, [TRUE], i, i);
                    }
                } else {
                    
                    // if people is away, then delete people from the list
                    // farewell(llList2Key(mobKeys, i));
                    string visit_id = llList2String(mobVisitId, i);
                    http_request_visit_left = xrequest(visit_api_url+"/{visits_id}", ["visits_id", visit_id]);

                    mobKeys = llDeleteSubList(mobKeys, i, i);
                    mobGreeted = llDeleteSubList(mobGreeted, i, i);
                    mobAway = llDeleteSubList(mobAway, i, i);
                    mobVisitId = llDeleteSubList(mobVisitId, i, i);

                }
            }
            
            is_operating = FALSE; // trigger end of operation
            
        }
    }

    dataserver(key queryid, string data)
    {
        if ( born_query == queryid )
        {
            llSay(0, "You're born : " + data);
        }
    }

    http_response(key request_id, integer status, list metadata, string body)
    {
        if (request_id == http_request_visitor)
        {
            string id = llJsonGetValue(body, ["id"]);
            // llSay(0, "visitor id : "+id);
            http_request_visit = xrequest(visit_api_url, ["visitors_id", id]);
        }
        else if (request_id == http_request_visit)
        {
            string id = llJsonGetValue(body, ["id"]);
            // llSay(0, "visit id : "+id);
            mobVisitId += id;
        }
        else if (request_id == http_request_visit_left)
        {
            // llSay(0, "left call api : "+body);
        }
    }
}