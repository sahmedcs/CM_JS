var dateFormat = function () {
	var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
	timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
	timezoneClip = /[^-+\dA-Z]/g,
	pad = function (val, len) {
		val = String(val);
		len = len || 2;
		while (val.length < len) {
			val = "0" + val;
		}
		return val;
	};
	return function (date, mask, utc) {
		var dF = dateFormat;
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) {
			throw SyntaxError("invalid date");
		}
		mask = String(dF.masks[mask] || mask || dF.masks["default"]);
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}
		var _ = utc ? "getUTC" : "get",
		d = date[_ + "Date"](),
		D = date[_ + "Day"](),
		m = date[_ + "Month"](),
		y = date[_ + "FullYear"](),
		H = date[_ + "Hours"](),
		M = date[_ + "Minutes"](),
		s = date[_ + "Seconds"](),
		L = date[_ + "Milliseconds"](),
		o = utc ? 0 : date.getTimezoneOffset(),
		flags = {
			d : d,
			dd : pad(d),
			ddd : dF.i18n.dayNames[D],
			dddd : dF.i18n.dayNames[D + 7],
			m : m + 1,
			mm : pad(m + 1),
			mmm : dF.i18n.monthNames[m],
			mmmm : dF.i18n.monthNames[m + 12],
			yy : String(y).slice(2),
			yyyy : y,
			h : H % 12 || 12,
			hh : pad(H % 12 || 12),
			H : H,
			HH : pad(H),
			M : M,
			MM : pad(M),
			s : s,
			ss : pad(s),
			l : pad(L, 3),
			L : pad(L > 99 ? Math.round(L / 10) : L),
			t : H < 12 ? "a" : "p",
			tt : H < 12 ? "am" : "pm",
			T : H < 12 ? "A" : "P",
			TT : H < 12 ? "AM" : "PM",
			Z : utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
			o : (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
			S : ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
		};
		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}
();
dateFormat.masks = {
	"default" : "ddd mmm dd yyyy HH:MM:ss",
	shortDate : "m/d/yy",
	shortDate2 : "mm/dd/yyyy",
	shortDate3 : "mm/dd/yy",
	shortDate4 : "mm/yyyy",
	shortDate5 : "yyyy",
	mediumDate : "mmm d, yyyy",
	longDate : "mmmm d, yyyy",
	fullDate : "dddd, mmmm d, yyyy",
	shortTime : "h:MM TT",
	mediumTime : "h:MM:ss TT",
	longTime : "h:MM:ss TT Z",
	militaryTime : "HH:MM",
	isoDate : "yyyy-mm-dd",
	isoTime : "HH:MM:ss",
	isoDateTime : "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime : "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
	longDateTime : "mm/dd/yyyy h:MM:ss TT Z",
	longDateTime2 : "mm/dd/yy HH:MM",
	longDateTime3 : "mm/dd/yyyy HH:MM",
	longDateTime4 : "mm/dd/yy hh:MM TT",
	shortDateTime : "mm/dd h:MM TT"
};
dateFormat.i18n = {
	dayNames : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	monthNames : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};
Date.prototype.format = function (mask, utc) {
	if (utc = "") {
		return "";
	} else {
		return dateFormat(this, mask, utc);
	}
};
Date.prototype.setISO8601 = function (string) {
	if (string != "") {
		var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(.([0-9]+))?)?(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
		var d = string.match(new RegExp(regexp));
		var offset = 0;
		var date = new Date(d[1], 0, 1);
		if (d[3]) {
			date.setMonth(d[3] - 1);
		}
		if (d[5]) {
			date.setDate(d[5]);
		}
		if (d[7]) {
			date.setHours(d[7]);
		}
		if (d[8]) {
			date.setMinutes(d[8]);
		}
		if (d[10]) {
			date.setSeconds(d[10]);
		}
		if (d[12]) {
			date.setMilliseconds(Number("0." + d[12]) * 1000);
		}
		if (d[14]) {
			offset = (Number(d[16]) * 60) + Number(d[17]);
			offset *= ((d[15] == "-") ? 1 : -1);
		}
		offset -= date.getTimezoneOffset();
		time = (Number(date) + (offset * 60 * 1000));
		this.setTime(Number(time));
	}
};

var amb_i18n = {
	ACCT_NUM : "Acct #",
	ACCT_NUMBER:"Account Number",
	ACCT_TOTAL : "Acct Bal",
	ADD : "Add",
	ADDRESS : "Address",
	ADJUSTED : "Adjusted",
	ADJUSTMENT_DESC : "Adjustment Description",
	ADJ_DET : "Adjustment Detail",
	ADJ : "Adjustments",
	AGENCY : "Agency",
	ALL : "All",
	ALL_BILLING_ENTITIES : "All Billing Entities",
	ALL_FACILITIES : "All Facilities",
	ALL_LOCATIONS : "All Locations",
	ALL_SELECTED : "All Selected",
	ALIAS : "Alias",
	ALIAS_DESC : "Alias Description",
	AMOUNT : "Amount",
	APPLY : "Apply",
	APPLIED_TO : "Applied to",
	APPLLIED_BY : "Applied by",
	AVAILABLE : "Available",
	AMOUNT_SENT : "Amount Sent",
	AUTOMATED_PAYMENT : "Automated Payment",
	BALANCE : "Balance",
	BALANCE_CLAIM_LEG_TITLE :"Balance and Claim Details",
	BATCH_NUM : "Batch Number",
	BAD_DEBT_LEGEND_TITLE : "Encounter has a bad debt balance",
	BEG_DATE : "Begin Date",
	BALANCE_SUMM : "Balance Summary",
	BAD_DEBT : "Bad Debt",
	BAD_DEBT_BAL : "Bad Debt Bal",
	BAD_DEBT_SELECTED_TITLE : "Display all encounters with a bad debt balance",
	BILLING_ENTITIES : "Billing Entities",
	BILLING_ENTITY : "Billing Entity",
	BILLING_HOLD_LEGEND_TITLE : "Encounter is on hold",
	BILLING_HOLD_TITLE : "Billing Hold Details",
	BILL_PROVIDER : "Billing Provider",
	BILLING_HOLD : "Hold",
	BILL_CODE : "Bill Code",
	CANCEL : "Cancel",
	CHARGE : "Charge",
	CHARGES : "Charges",
	CHARGE_SUMMARY : "Charge Summary",
	CHARGE_DETAILS : "Charge Details",
	CHARGE_DETAIL : "Charge Detail",
	CREDIT_CHARGE_DETAIL : "Credit Charge Detail",
	CLAIM_NUM : "Claim #",
	CLAIM_NUMBER : "Claim Number",
	CLICK_MOD_DISP_FILTERS : "Click to Modify Display Filters",
	CLOSE : "Close",
	CLAIM_NUM_TITLE : "Claim Number",
	CODE : "Code",
	COLLAPSE : "Collapse",
	COLLAPSE_ALL : "Collapse All",
	CONSOLIDATE_GUARANTOR : "Consolidate Guarantor",
	CREDIT_AMOUNT : "Credit Amount",
	CREDITED : "Credited",
	CREDITED_CHARGE : "Credited Charge",
	CREATION_DATE : "Creation Date",
	CURRENT_STANDING_ACCT : "Current Standing for Account",
	CLAIM_BALANCE_SUMMARY : "Balance and Claim Summary",
	CLAIM_SUMM : "Claim Summary",
	CLAIM_DETAIL : "Claim Details",
	CLAIM : "Claim",
	CLAIM_NOT_FOUND : "No Claims found for this Encounter.",
	CLAIM_SELECTED : "Claim Selected",
	CLAIM_DETAIL_REPORT:"Claim Details Report",
	CLAIM_DETAIL_HEAD : "Claim Detail",
	COLLECTION_DETAIL : "Collections details",
	DATE : "Date",
	DATE_SENT : "Date Sent",
	DATES_NOT_SELECTED : "Dates not selected, select dates to view report",
	DATEOFSERVICE:"Date of Service",
	DIAG : "Diagnosis",
	DESCRIB : "Description",
	DISP_ALL_ENC_W_BAL : "Display all encounters with a balance",
	DISP_ALL_ENC : "Display all encounters in defined date range",
	DISP_FILTERS : "Display Filters",
	DOB : "DOB",
	DOS:"DOS",
	ENCOUNTER : "Encounter",
	ENCOUNTER_DATE : "Encounter Date",
	ENCOUNTER_DATE_RANGE : "Encounter Date Range",
	ENCOUNTER_DETAIL : "Encounter Detail",
	ENC_NUM : "Encounter #",
	ENC_NUMBER :"Encounter Number",
	ENC_SUMMARY : "Encounter Summary",
	ENC_TOTAL : "Encounter Totals",
	ENC_BALANCE : "Enc Bal",
	END_DATE : "End Date",
	ENC_TYPE : "Encounter Type",
	ENDING_BALANCE : "Ending Balance",
	EXPAND : "Expand",
	EXPAND_ALL : "Expand All",
	EOB_DETAILS:"EOB Details",
	EOB : "EOB",
	EOB_TYPE_PAYMENT : "Payment",
	EOB_TYPE_ADJUSTMENT : "Adjustment",
	EOB_TYPE_INFO_ONLY : "Info only",
	EOB_TYPE_TECHNICAL : "Technical Denial",
	EOB_PATIENT_LIABILITY : "Patient Liability",
	EOB_PROVIDER_LIABILITY : "Provider Liability",
	EOB_TEXT_DENIAL : "Free Text Denial",
	EVENTS : "Events",
	FACILITY : "Facility",
	FACILITIES : "Facilities",
	FIN : "FIN",
	FIN_NUMBER : "Encounter Number",
	FCLASS : "Financial Class",
	FINAL_PAYMENT : "Final Payment",
	GUAR_BAL_EXPLAINED : "Balance summary of displayed encounters",
	GUARANTOR_BALANCE : "Guarantor Balance",
	GUAR_CHECKED : "Display all accounts patient is responsible for",
	GUARANTOR_DETAILS : "Guarantor Details",
	GUAR_UNCHECKED : "Only display current patient accounts",
	GUARANTOR_VIEW : "Guarantor View",
	GUARANTOR : "Guarantor",
	HOME_PHONE : "Home Phone",
	HEALTH_PLAN : "Health Plan",
	INS_ADJUSTMENTS : "Insurance Adjustments",
	INS_BAL : "Ins Bal",
	INS_BALANCE : "Insurance Balance",
	INS_PAYMENTS : "Insurance Payments",
	INS_TRANSACTION : "Insurance Transaction",
	INSTALL_AMOUNT : "Installment Amount",
	INSTITUTIONAL : "Institutional",
	ITEMIZED : "Itemized",
	ITEMIZED_MISSING_DISCLAIMER : "Itemized Report is only available in All View.",
	ITEMIZED_SELECTED_DISCLAIMER : "The Itemized Report will only provide details of the patient currently in perspective.",
	INCL_EOB : "Include EOB",
	LAST_CLAIM_NUM : "Last Claim #",
	LATE_CHARGE : "Late",
	LAST_STMT_AMT : "Last Stmt Amt",
	LAST_STMT_DT : "Last Stmt Dt",
	LEDGER_REPORT : "Ledger Report",
	LEGEND : "Legend",
	LOCATION : "Location",
	LOCATIONS : "Locations",
	METHOD : "Method",
	MEM_NUM : "Member Number",
	MOBILE_PHONE : "Mobile Phone",
	MODIFIER : "Modifier",
	MOVE_TO_LEFT : "Move to left",
	MOVE_TO_RIGHT : "Move to right",
	MULTIPLE : "Multiple",
	NAME : "Name",
	NO : "No",
	NO_CHRG : "No charges found",
	NO_ENC : "No encounters found for selected filters",
	NO_PAT_ACCT : "No patient account found",
	NO_TRANS : "No transactions found",
	NO_EOB : "No Insurance Transactions Found for this Claim.",
	NON_LINE_ITEM_POSTED : "Additional Transactions",
	NEXT_PAYMENT_DUE : "Next Payment Due",
	OPEN : "Open",
	ORDERING_PROV : "Ordering Provider",
	ORGI_AMOUNT : "Original Amount",
	PAID : "Paid",
	PAGE : "Page",
	PAT_ADJUSTMENTS : "Patient Adjustments",
	PAYMENT_LOC : "Payment Location",
	PAT_BAL : "Pat Bal",
	PAT_BALANCE : "Patient Balance",
	PAT_NAME : "Patient Name",
	PAT_NAME_CLM : "Patient",
	PAT_PAYMENTS : "Patient Payments",
	PAT_TRANSACTION : "Patient Transaction",
	PAYMENT_DESC : "Payment Description",
	PAY : "Payments",
	PAYMENT_DET : "Payment Detail",
	PAYMENT_PLAN_LEGEND_TITLE : "Encounter is currently part of a payment plan",
	PAYMENT_PLAN_TITLE : "Payment Plan Details",
	PAYMENT_FREQ : "Payment Frequency",
	PERFORMING_PROV : "Performing Provider",
	POSTED_STATUS : "Posted",
	POSTING_LEVEL : "Posting Level",
	PREVIOUS_BALANCE : "Previous Balance",
	PRINT : "Print",
	PRINT_RPT : "Print Ledger Report",
	PRINT_CLM : "Print Claim report",
	PROFESSIONAL : "Professional",
	POSTED_BY : "Posted by",
	POSTED_TO:"Posted to",
	POSTED_DATE : "Posted Date",
	PROVIDER : "Provider",
	REFRESH : "Refresh",
	REFRESH_DATA_ONLY : "Refresh Data and Maintain Filters",
	REMOVE : "Remove",
	REPORT_TYPE : "Report Type",
	REVERSED : "Reversed",
	REVERSE_DATE : "Reverse Date",
	REVERSED_TRANSACTION : "Reversed Transaction",
	REVERSAL_PAY_DET : "Reversal Payment Detail",
	REVERSAL_ADJ_DET : "Reversal Adjustment Detail",
	REVERSAL_STATUS : "Reversal",
	RELATED_PAYMENTS : "Related Payments",
	RELATED_ADJ : "Related Adjustments",
	RETURN_DATE : "Return Date",
	RETURN_REASON : "Return Reason",
	RETURN_BALANCE : "Return Balance",
	REM_AMOUNT : "Remaining Amount",
	REM_PAYMENTS : "Remaining Payments",
	REMAINDER : "Remainder",
	REASON : "Reason",
	RUN : "Run",
	RUN_BY : "Run By",
	ROLL_DATE : "Rolled Date",
	ROLL_BY : "Rolled By",
	SEARCH : "Search",
	SELECT_ALL : "Select All",
	SELECTED : "Selected",
	SELFPAY : "Self Pay",
	SEQUENCE_PRIMARY : "Primary",
	SEQUENCE_SECONDARY : "Secondary",
	SEQUENCE_TERTIARY : "Tertiary",
	SEQUENCE_QUATERNARY : "Quaternary",
	SEQUENCE_QUINARY : "Quinary",
	SEQUENCE_SENARY : "Senary",
	SEQUENCE_UNKNOWN : "Unknown",
	SERVICE_DATE : "Service Date",
	SEQ : "Sequence",
	SORT_BY : "Sort Encounters By",
	SUMMARY_AMOUNT : "Summary Amount",
	SUBSCRIBER : "Subscriber",
	SUB_DATE : "Submitted Date",
	STATUS : "Status",
	TO : "to",
	TOTALS : "Totals",
	TOTAL_INS_PAY : "Total Ins Payments",
	TOTAL_INS_ADJ : "Total Ins Adjustments",
	TOTAL_PAT_PAY : "Total Patient Payments",
	TOTAL_PAT_ADJ : "Total Patient Adjustments",
	TOTAL_BALANCE : "Total Balance",
	TOTAL_PAYMENT : "Total Payment",
	TOTAL_ADJUSTMENT : "Total Adjustment",
	TOTAL_RELATED_PAYMENTS : "Total Related Payments",
	TOTAL_ADJ_PAYMENTS : "Total Related Adjustments",
	TRANSACTION_DATE : "Transaction Date",
	TRANSACTION_DATE_RANGE : "Transaction Date Range",
	TRANSACTION_TYPE : "Transaction Type",
	TRANSCATION_SUB_TYPE : "Trans Sub Type",
	TRANSACTION_TYPE_NOT_SELECTED : "No transaction types selected, please select at least one.",
	TRANS_DATE : "Transmitted Date",
	TTYPE : "Transcation Type",
	TYPE : "Type",
	UNITS : "Units",
	VIEW : "View",
	VIEW_GUARANTOR_DETAILS : "View Guarantor Details",
	VIEW_LEGEND : "View Legend",
	YES : "Yes"
};
