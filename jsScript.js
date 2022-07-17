const namesA = 
[
	"JungleTV 🍌",
	"Somoon 🍌",
	"Tanya",
	"Colin",
	"Alison",
	"OnlyBans 🍌",
	"Folding 🍌",
	"Jake",
	"John",
	"Snow",
	"BananoPlanet.cc 🍌",
	"BananOslo 🍌",
	"Stuart", 
	"Moonano 🍌",
	"Finn",
	"Rowland",
	"Kalium 🍌",
	"Guy",
	"Kuyumcu 🍌"
]

const bananoAddresses =
{
	"Somoon" : "ban_14xjizffqiwjamztn4edhmbinnaxuy4fzk7c7d6gywxigydrrxftp4qgzabh",
	"BananoPlanet.cc" : "ban_3p1anetee7arfx9zbmspwf9c8c5r88wy6zkgwcbt7rndtcqsoj6fzuy11na3",
	"BananOslo" : "ban_3p3sp1ynb5i3qxmqoha3pt79hyk8gxhtr58tk51qctwyyik6hy4dbbqbanan",
	"Moonano" : "ban_1moonanoj76om1e9gnji5mdfsopnr5ddyi6k3qtcbs8nogyjaa6p8j87sgid",
	"Kalium" : "ban_1ka1ium4pfue3uxtntqsrib8mumxgazsjf58gidh1xeo5te3whsq8z476goo",
	"Folding" : "ban_3fo1d1ng6mfqumfoojqby13nahaugqbe5n6n3trof4q8kg5amo9mribg4muo",
	"OnlyBans" : "ban_1on1ybanskzzsqize1477wximtkdzrftmxqtajtwh4p4tg1w6awn1hq677cp",
	"Kuyumcu" : "ban_1oaocnrcaystcdtaae6woh381wftyg4k7bespu19m5w18ze699refhyzu6bo",
	"JungleTV" : "ban_1jung1eb3uomk1gsx7w6w7toqrikxm5pgn5wbsg5fpy96ckpdf6wmiuuzpca"
}

let history = Object;
let totalTransacations = 0;
let currentPage = 0;
let totalPages = 0;
let reminder = 0;
let bDataInit = false;
let localBGColour;
let bgColorr;

const greyColour = "rgb(82 81 81 / 65%)";//#4e4e4e";
const yellowColour = "#ffe135";
const whiteColour = "white";
const jungleColour = "rgb(53 155 45)";

window.onload = function()
{
	insertNames();
	getColour();
	changeBGColour();

}

function sortNamesArray()
{
	namesA.sort();
	insertNames();

}

//insert names into datalist
function insertNames()
{
	let optionsString="";
	for (let i=0; i < namesA.length;++i){
		optionsString += '<option value="'+namesA[i]+'" />';
		}
		let my_list=document.getElementById("listA");
		my_list.innerHTML = optionsString;
}

//process select name from the list and check if have a ban address and retrieve data.
function sendSelectedName()
{
	if(bDataInit == true) {resetAllData();}
	
	let selectedName = document.getElementById("nameInput").value;

	if(selectedName != "" && namesA.includes(selectedName))
	{
		selectedName=selectedName.substr(0,selectedName.length-2).trim();
	
		let ind = Object.keys(bananoAddresses).indexOf(selectedName);
		if(ind !== -1)
		{
			let banAddr = bananoAddresses[selectedName];
			
			//Selected name showen in table
			document.getElementById("choosenName").innerHTML = '<span id="hBold">Name: </span>'+selectedName;
			//Addr
			document.getElementById("choosenAddr").innerHTML = '<span id="hBold">Address: </span>'+banAddr;
			//Addr MonKey
			document.getElementById("col0-img").innerHTML = '<img src="https://monkey.banano.cc/api/v1/monkey/'+banAddr+'">';
			
			//set up transactions rows
			if(bDataInit == false) { initializeransacationRows(); }
			parseJsonBody(bananoAddresses[selectedName]);

			//banano address details dection hidden by default.
			document.getElementById("bData").style.display = "block";
			document.getElementById("noBanAddr").style.display = "none";
			bDataInit = true;
		}
		else
		{
			document.getElementById("noBanAddr").innerHTML = colourMe("red","This name does not have an address assigned to them!");
			document.getElementById("noBanAddr").style.display = "block";
			document.getElementById("bData").style.display = "none";
		}
	}
}

//create JSON Body of given address
function parseJsonBody(banAddr)
{
	let body = "";

	//for balance
	body = '{ "action": "account_info","account": "' + banAddr +'" }';
	sendPOST(body, 0)

	//for last three transacations
	body = '{ "action": "account_history","account": "' + banAddr +'","count": 30, "raw" : 1 }';
	sendPOST(body, 1)
}

/*
Sends POST request of given body
*/
function sendPOST(data, dType)
{
	let xhr = new XMLHttpRequest();
	xhr.open("POST", "https://kaliumapi.appditto.com/api");
	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onload = () => printData(xhr.responseText, dType);
	xhr.send(data);

}

// process returned data from POST request. 
// there are two requested data, account_info and account_history
function printData(returnData, dType)
{
	if (dType == 0)
	{
		let jsonResponse = JSON.parse(returnData);
		let balance = parseFloat(jsonResponse["balance_decimal"]).toFixed(2)
		document.getElementById("balance").innerHTML= '<span id="hBold">Balance: </span>' + balance+" BAN";
	}
	else if (dType == 1)
	{
	
		let jsonResponse = JSON.parse(returnData);
		history = jsonResponse.history;
		totalTransacations = history.length;
		document.getElementById("transactionsNo").innerText= totalTransacations;
		createRows();
		
		totalPages = Math.floor(totalTransacations / 3);
		reminder = totalTransacations % 3;
		if(reminder != 0) { totalPages++;}

		createPageList();
	}
}

// write HTML code that will have the transactions
function initializeransacationRows()
{
	for(let i = 0; i < 3; i++)
	{
		let mainDL = document.getElementById("transactions");

		let dt = document.createElement("dt");
		dt.setAttribute("id","dtID"+i);
		dt.setAttribute("hidden","");
		//dt.setAttribute("style"," cursor: pointer");
		dt.innerHTML = '<span id="tran'+i+'" onclick="toggleTrans('+i+')"></span>';

		let dd = document.createElement("dd");
		dd.setAttribute("id","ddID"+i);
		dd.setAttribute("hidden","");
		dd.innerHTML = '<span id="t'+i+'dets" style="display: none;"></span>';

		mainDL.append(dt);
		mainDL.append(dd);
	}
}

/*
@createPageList()
@createPage()
setup the page selector to browse the transactions
*/
function createPageList()
{	
	let displayedPageNum = currentPage+1;
	createPage("<<",1);
	createPage("<",1);

	for(let i = 0; i < totalPages; i++)
	{
		
		createPage(displayedPageNum,displayedPageNum);
		displayedPageNum++;

	}
	document.getElementById("page"+(currentPage+1)).setAttribute("class","page selected");
	createPage(">",2);
	createPage(">>",totalPages);

	disablePageButton(currentPage+1);
	
}

function createPage(PageStr,displayedPageNum)
{
	let pagesSpan = document.getElementById("pNums");
	let pagesElement = document.getElementById("pNums");

	//create << < > >>
	let pageElem = document.createElement("button");
	pageElem.setAttribute("onclick","selectPage("+displayedPageNum+")");
	pageElem.setAttribute("class","page");
	pageElem.setAttribute("id","page"+PageStr);
	pageElem.innerHTML = PageStr ;
	pagesElement.append(pageElem);
}


//setup selected page html code and display new trans and disable the button. shows transactions limit is address has over 30 trans
function selectPage(displayedPageNum)
{
	document.getElementById("page"+(currentPage+1)).setAttribute("class","page");
	document.getElementById("page"+(displayedPageNum)).setAttribute("class","page selected");

	disablePageButton(displayedPageNum);

	pageNum = displayedPageNum-1;
	if(pageNum == -1){ return 0;}
	
	currentPage = pageNum;
	closeTransactions();

	let lw = document.getElementById("limitWarning");
	if( !lw.hasAttribute("hidden") )
	{ 
		lw.setAttribute("hidden","");
	}
	
	if(displayedPageNum == totalPages && reminder != 0)
	{
		hideRows();
		createRows(reminder);
	}
	else
	{	
		createRows();
	}

	if(displayedPageNum == totalPages && totalTransacations == 30)
	{
		lw.removeAttribute("hidden");
	}
	
	editPage(">");
	editPage("<");
}

//disable selected page button
function disablePageButton(page)
{
	let toDisableButton = document.getElementById("page"+page);
	toDisableButton.setAttribute("disabled","");

	if((currentPage+1) != page)
	{
		let currDisabledButton = document.getElementById("page"+(currentPage+1));
		currDisabledButton.removeAttribute("disabled");
	}

	if(page == totalPages)
	{
		document.getElementById("page>").setAttribute("disabled","");
		document.getElementById("page>>").setAttribute("disabled","");
	}
	else if((currentPage+1) == totalPages)
	{
		document.getElementById("page>").removeAttribute("disabled");
		document.getElementById("page>>").removeAttribute("disabled");
	}
	if(page == 1)
	{
		document.getElementById("page<").setAttribute("disabled","");
		document.getElementById("page<<").setAttribute("disabled","");
	}
	else if(currentPage == 0)
	{
		document.getElementById("page<").removeAttribute("disabled");
		document.getElementById("page<<").removeAttribute("disabled");
	}
}

//modify special page button
function editPage(page)
{

	let modifyPageElem = document.getElementById("page"+page);
	if(page == ">" && currentPage+1 != totalPages)
	{
		modifyPageElem.setAttribute("onclick","selectPage("+(currentPage+2)+")");
	}
	else if(page == ">" && currentPage+1 == totalPages)
	{
		modifyPageElem.setAttribute("onclick","selectPage("+(totalPages)+")");
	}
	else if(page == "<" && currentPage != 0)
	{
		modifyPageElem.setAttribute("onclick","selectPage("+(currentPage)+")");
	}
	else if(page == "<" && currentPage == 0)
	{
		modifyPageElem.setAttribute("onclick","selectPage(1)");
	}
}

//hide rows if there are not enough transaction data to populate them
function hideRows()
{
	for(let i = 0; i < 3; i++)
	{

		let dt = document.getElementById("dtID"+i);
		dt.setAttribute("hidden","");

		let dd = document.getElementById("ddID"+i);
		dd.setAttribute("hidden","");

	}
}

//setup transaction row
function createRows(limit)
{
	limit = limit || 3;  // implemented to only print last x rows if its less than 3

	let index = 3*currentPage;

	for(let i = 0; i < limit; i++)
	{
		let type = "";
		let amount = "";
		let recipient = "";
		let transData = "";
		let transTitleElement = "";
		let transDataElement = "";
		let currentData = history[index+i];

		transTitleElement = document.getElementById("tran"+i);
		transDataElement=document.getElementById("t"+i+"dets");
		type = currentData.subtype; 
		
		//style the block type
		switch(type)
		{
			case "send":
				transTitleElement.innerHTML = '<span class="label cRed">'+type+'</span> ';
			break;
			case "receive":
				transTitleElement.innerHTML = '<span class="label cGreen">'+type+'</span> ';
			break;
			case "change":
				transTitleElement.innerHTML = '<span class="label cBlue">'+type+'</span> ';
			break;
		}

		if(currentData.amount_decimal !== undefined)
		{
				amount = parseFloat(currentData.amount_decimal).toFixed(2)
				transTitleElement.innerHTML = transTitleElement.innerHTML+ ''+amount;

		}

		transTitleElement.innerHTML = transTitleElement.innerHTML+ ' <i id="arrow'+i+'" class="arrow down"></i><br>';

		if(type == "receive")
		{
			transData = '<span id="hBold">From: </span>' + currentData.account;
			transData = transData + '<br> <span id="hBold">Amount: </span>'+colourMe("green",'+'+amount);
		}
		else if(type == "send")
		{
			transData = '<span id="hBold">To: </span>' + currentData.account;
			transData = transData + '<br> <span id="hBold">Amount: </span>'+colourMe("red",'-'+amount);
		}
		else if(type == "change")
		{
			transData = '<span id="hBold">New rep: </span>'+currentData.representative;
		}

		let myDate = new Date(currentData.local_timestamp *1000);
		let timedate = myDate.toLocaleString("en-GB");
		transData = transData +'<br> <span id="hBold">Time: </span>'+timedate;

		transDataElement.innerHTML = transData;

		document.getElementById("dtID"+i).removeAttribute("hidden");
		document.getElementById("ddID"+i).removeAttribute("hidden");
	}
}

// Clear/reset page to default when selecting new ban address

function resetAllData()
{
	closeTransactions();
	clearPagelist();
	totalTransacations = 0;
	currentPage = 0;
	totalPages = 0;
	history = null;

	let lw = document.getElementById("limitWarning");
	if( !lw.hasAttribute("hidden") )
		{ lw.setAttribute("hidden","");}

}

//reset page selector list
function clearPagelist()
{
	if(document.getElementById("page1")==null){return 0;}

	//clearing specialpages like this for now
	removePage(">");
	removePage(">>");
	removePage("<");
	removePage("<<");

	for(let i = 0; i < totalPages; i++)
	{
		
		removePage(i+1);
	}
}

function removePage(pID)
{
	let tempP = "page"+(pID);
	
	document.getElementById(tempP).remove();
}

function closeTransactions()
{
	for(let i = 0; i < 3; i++)
	{
		let arrowElement = document.getElementById("arrow"+i);
		let tdetsElement = document.getElementById('t'+i+'dets');
		let toggle = tdetsElement.style.display;

		if(toggle == "block")
		{
			tdetsElement.style.display = "none";
			arrowElement.className ="arrow down";
		}
	}
}

function toggleTrans(id)
{

	let arrowElement = document.getElementById("arrow"+id);
	let tdetsElement = document.getElementById('t'+id+'dets');
	let toggle = tdetsElement.style.display;

	
	if(toggle == "block")
	{
		tdetsElement.style.display = "none";
		arrowElement.className ="arrow down";
	}
	else if (toggle == "none")
	{
		tdetsElement.style.display = "block";
		arrowElement.className ="arrow up"; 
	}
}

function colourMe(color,str)
{
	if(color == "red")
	{
		return '<span class="fRed">'+str+"</span>";
	}
	else if(color == "green")
	{
		return '<span class="fGreen">'+str+"</span>";
	}
}


// called from html page
function changeBGColour()
{
	setBGColour()
	switch (localBGColour)
	{
		case 0:
			window.localStorage.setItem("bgColour",2);
			
		break;
		case 1:
			window.localStorage.setItem("bgColour",0);
		break;
		case 2:
			window.localStorage.setItem("bgColour",1);
		break;
	}
	
}

//Sets background color based on stored config or set default
function setBGColour()
{
	localBGColour = ((localBGColour == null) ? parseInt(bgColorr) : localBGColour);

	let bodyElement = document.getElementById("m-c");
	let bData0 = document.getElementById("bData-0");
	let bData1 = document.getElementById("bData-1");

	switch (localBGColour)
	{
		case 0:
			bodyElement.style.backgroundColor = whiteColour;
			bData0.style.backgroundColor = greyColour;
			bData1.style.backgroundColor = greyColour;
			localBGColour = 1;
		break;
		case 1:
			bodyElement.style.backgroundColor = jungleColour;
			bData0.style.backgroundColor = yellowColour;
			bData1.style.backgroundColor = yellowColour;
			localBGColour = 2;
		break;
		/*case 2:
			document.body.style.backgroundColor = jungleColour;
			localBGColour = 3;
		break;*/
		case 2:
			bodyElement.style.backgroundColor = greyColour;
			bData0.style.backgroundColor = whiteColour;
			bData1.style.backgroundColor = whiteColour;
			localBGColour = 0;
		break;
	}
}
function getColour()
 {	
	bgColorr = ((window.localStorage.getItem("bgColour") !== null) ? window.localStorage.getItem("bgColour") : window.localStorage.setItem("bgColour",1)) ;
}

