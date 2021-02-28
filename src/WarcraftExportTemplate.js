function template(strings, ...keys) {
    return (function(...values) {
        let dict = values[values.length - 1] || {};
        let result = [strings[0]];
        keys.forEach(function(key, i) {
        let value = Number.isInteger(key) ? values[key] : dict[key];
        result.push(value, strings[i + 1]);
        });
        return result.join('');
    });
}  

const libraryTemplate = template
`library LocalizationData requires Table
globals
	public constant integer LANGUAGE_COUNT = ${"languageCount"}
	public constant integer ENGLISH_ID = 1
	public constant integer LANGUAGE_ROW_ID = 'LTIT'
endglobals

private struct LanguageData extends array
	public string Code
		
	private static method onInit takes nothing returns nothing
${"languageData"}
	endmethod
endstruct

private struct LocalizationData extends array	
	public static HashTable Localizations
	
	private static method onInit takes nothing returns nothing
		set thistype.Localizations = HashTable.create()
		
${"localizationData"}
	endmethod
endstruct

function GetIDForLanguageCode takes string langCode returns integer
	local integer iLangData = 1
	
	loop
	exitwhen iLangData > LANGUAGE_COUNT
		if LanguageData(iLangData).Code == langCode then
			return iLangData
		endif
	set iLangData = iLangData + 1
	endloop
	
	return 0
endfunction
function GetLanguageCodeFromID takes integer id returns string
	return LanguageData(id).Code
endfunction

function ConvertInputToLanguageCode takes integer contentID, string input returns string
	local integer iLangData = 1
	
	loop
	exitwhen iLangData > LANGUAGE_COUNT
		if StringCase(LocalizationData.Localizations[contentID].string[iLangData], false) == StringCase(input, false) then
			return GetLanguageCodeFromID(iLangData)
		endif
	set iLangData = iLangData + 1
	endloop
	
	return null
endfunction
function ConvertLanguageToLanguageCode takes string language returns string
	return ConvertInputToLanguageCode(LANGUAGE_ROW_ID, language)
endfunction

function LocalizeContent takes integer contentID, string langCode returns string
	/*if LocalizationData.Localizations[contentID].has(GetIDForLanguageCode(langCode)) then
		return LocalizationData.Localizations[contentID].string[GetIDForLanguageCode(langCode)]
	else
		call DisplayTextToPlayer(GetLocalPlayer(), 0, 0, "Defaulted localization")
		return LocalizationData.Localizations[contentID].string[ENGLISH_ID]
	endif*/
	return LocalizationData.Localizations[contentID].string[GetIDForLanguageCode(langCode)]
endfunction
function LocalizeContentEx takes integer contentID, integer langID returns string
	/*if LocalizationData.Localizations[contentID].has(langID) then
		return LocalizationData.Localizations[contentID].string[langID]
	else
		call DisplayTextToPlayer(GetLocalPlayer(), 0, 0, "Defaulted localization")
		return LocalizationData.Localizations[contentID].string[ENGLISH_ID]
	endif*/
	return LocalizationData.Localizations[contentID].string[langID]
endfunction

function PrintLocalizationsForContent takes integer contentID returns nothing
	local integer iLangData = 1
	
	loop
	exitwhen iLangData > LANGUAGE_COUNT
		call DisplayTextToPlayer(GetLocalPlayer(), 0, 0, LocalizeContentEx(contentID, iLangData))
	set iLangData = iLangData + 1
	endloop
endfunction

endlibrary`;

const languageTemplate = template`set LanguageData(${"languageIndex"}).Code = "${"languageCode"}"`;
const localizationTemplate = template`set thistype.Localizations[${"contentID"}].string[${"languageIndex"}] = "${"localizedValue"}"`;

export { libraryTemplate, languageTemplate, localizationTemplate };