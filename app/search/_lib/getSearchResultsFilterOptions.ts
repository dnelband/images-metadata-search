import { restrictionDelimiterRegex } from "@/app/_lib/const";
import { FilterOptions, SearchResult } from "../../_lib/types";

const getItemRestrictions = (suchtext: string): string => {
    const matches = suchtext.match(restrictionDelimiterRegex);
    if (matches) {
        return matches.map(match => match.trim()).join(" ");
    }
    return "";
}

export const getSearchResultsFilterOptions = (data: SearchResult[]): FilterOptions => { 
    return data.reduce((acc: FilterOptions, item) => {
        if (item.fotografen && !acc.fotografen?.includes(item.fotografen)) {
            acc.fotografen = [...(acc.fotografen || []), item.fotografen];
        }
        if (item.datum && !acc.datum?.includes(item.datum)) {
            acc.datum = [...(acc.datum || []), item.datum];
        }
        const itemRestrictions = getItemRestrictions(item.suchtext);
        if (itemRestrictions && !acc.restrictions?.includes(itemRestrictions)) {
            acc.restrictions = [...(acc.restrictions || []), itemRestrictions];
        }
        return acc;
    }, {
        fotografen: [],
        datum: [],
        restrictions: []
    });
}