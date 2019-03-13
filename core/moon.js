"use strict"

const cheerio = require("cheerio");
const select = require("soupselect-update").select;
const htmlparser = require("htmlparser2");
const request = require("request-promise");
const jp = require('jsonpath');
const RATE = {
  'USD': 24000,
  'EUR': 30000
}
const CATEGORIES = {
  GLASSES: {
    ID: "GLASSES",
    SHIP: 0,
    EXTRA: 5,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.1,
    HVANCHOR: 500,
    NAME: "Kính mát",
    NOTE: "Phụ thu $5/cái",
    KEYWORD: ["sunglasses", "eyewear accessories"],
    NOTKEYWORD: []
  },
  BELT: {
    ID: "BELT",
    SHIP: 11,
    EXTRA: 0,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.1,
    HVANCHOR: 500,
    NAME: "Dây nịt",
    NOTE: "Phí ship $11/kg",
    KEYWORD: ["belt"],
    NOTKEYWORD: []
  },
  WATCH: {
    ID: "WATCH",
    SHIP: 0,
    EXTRA: 15,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.1,
    HVANCHOR: 500,
    NAME: "Đồng hồ",
    NOTE: "Phụ thu $15/cái",
    KEYWORD: ["watches"],
    NOTKEYWORD: []
  },
  JEWELRY: {
    ID: "JEWELRY",
    SHIP: 0,
    EXTRA: 5,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.1,
    HVANCHOR: 500,
    NAME: "Trang sức",
    NOTE: "Phụ thu $5/cái",
    KEYWORD: ["> jewelry"],
    NOTKEYWORD: ["> shoes", "cleaning", "care"]
  },
  BIKE: {
    ID: "BIKE",
    SHIP: 12,
    EXTRA: 40,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.1,
    HVANCHOR: 500,
    NAME: "Xe đạp",
    NOTE: "Phí ship $12/kg + Phụ thu $40/chiếc",
    KEYWORD: ["bike", "walker", "rollator","cycling"],
    NOTKEYWORD: ["accessories"]
  },
  KITCHENAPPLIANCE: {
    ID: "KITCHENAPPLIANCE",
    SHIP: 12,
    EXTRA: 0,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.1,
    HVANCHOR: 500,
    NAME: "Dụng cụ nhà bếp",
    NOTE: "Phí ship $12/kg",
    KEYWORD: ["coffee machine", "blender", "brewer", "appliance"],
    NOTKEYWORD: ["> paper & plastic"]
  },
  DVD: {
    ID: "DVD",
    SHIP: 10,
    EXTRA: 0,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0,
    HVANCHOR: 500,
    NAME: "Đĩa nhạc, game",
    NOTE: "Phí ship $10/kg",
    KEYWORD: ["video games", " > games","blu-ray >", "dvd >"],
    NOTKEYWORD: ["accessories", "controllers", " > consoles", "cards"]
  },
  CHEMICAL_VITAMIN: {
    ID: "CHEMICAL_VITAMIN",
    SHIP: 11,
    EXTRA: 0,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0,
    HVANCHOR: 500,
    NAME: "Thuốc - Vitamin - Hóa chất",
    NOTE: "Phí ship $11/kg",
    KEYWORD: [
      "beauty & grooming",
      "oil",
      "vitamin",
      "supplement",
      "personal care",
      "liquid",
      "health supplies",
      "cleaning & care"
    ],
    NOTKEYWORD: ["> professional dental supplies", "> toothbrushes","diffusers", "candles"]
  },
  PHONE_TABLET_LAPTOP: {
    ID: "PHONE_TABLET_LAPTOP",
    SHIP: 12,
    EXTRA: 40,
    PRICEEXTRA: 70,
    PRICEANCHOR: 25,
    HVEXTRA: 0.1,
    HVANCHOR: 500,
    NAME: "Điện thoại - Laptop",
    NOTE: "Phí ship $12/kg + Phụ thu $40/cái",
    KEYWORD: [
      "amazon devices",
      "> unlocked cell phones",
      "laptops >",
      "> carrier cell phones"
    ],
    NOTKEYWORD: ["computer components","laptop accessories","tablet accessories","computer accessories"]
  },
  CONSOLE: {
    ID: "CONSOLE",
    SHIP: 13,
    EXTRA: 0,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.1,
    HVANCHOR: 0,
    NAME: "Máy chơi game",
    NOTE: "Phí ship $13/kg",
    KEYWORD: [" > consoles"],
    NOTKEYWORD: []
  },
  CAMERA: {
    ID: "CAMERA",
    SHIP: 0,
    EXTRA: 35,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.1,
    HVANCHOR: 500,
    NAME: "Camera",
    NOTE: "Phụ thu $35/chiếc",
    KEYWORD: ["camera & photo > video >", "camera & photo > dslr cameras"],
    NOTKEYWORD: ["accessories"]
  },
  GOLF: {
    ID: "GOLF",
    SHIP: 12,
    EXTRA: 0,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.1,
    HVANCHOR: 500,
    NAME: "Golf",
    NOTE: "Phí ship $12/kg",
    KEYWORD: ["golf club", " > racquets"],
    NOTKEYWORD: []
  },
  DIGITAL: {
    ID: "DIGITAL",
    SHIP: 13,
    EXTRA: 0,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.05,
    HVANCHOR: 500,
    NAME: "Điện tử",
    NOTE: "Phí ship $13/kg",
    KEYWORD: [
      "electronics",
      "machines",
      "television",
      "computer",
      "laptop",
      "monitor",
      "device",
      "headphones"
    ],
    NOTKEYWORD: [
      "kids",
      "learning",
      "education",
      "audio & video accessories",
      "screen protectors",
      "cases",
      "bags",
      "camera & photo accessories",
      "accessory kits",
      "cables",
      "holder",
      "stands",
      "cradles",
      "mounts",
      "repair kits",
      "sticks",
      "tripods",
      "styluses"
    ]
  },
  AUTOMOTIVE: {
    ID: "AUTOMOTIVE",
    SHIP: 11,
    EXTRA: 0,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.05,
    HVANCHOR: 500,
    NAME: "Phụ kiện xe hơi",
    NOTE: "Phí ship $11/kg",
    KEYWORD: ["> wheels & tires >",
             "> engine & chassis parts"],
    NOTKEYWORD: []
  },
  MILK: {
    ID: "MILK",
    SHIP: 7.5,
    EXTRA: 0,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.1,
    HVANCHOR: 500,
    NAME: "Sữa",
    NOTE: "Phí ship $7.5/kg",
    KEYWORD: ["bottled beverages, water & drink mixes"],
    NOTKEYWORD: []
  },
  CLOTHES: {
    ID: "CLOTHES",
    SHIP: 8.5,
    EXTRA: 0,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.1,
    HVANCHOR: 500,
    NAME: "Quần áo, giày dép",
    NOTE: "Phí ship $8.5/kg",
    KEYWORD: ["clothing, shoes & jewelry >"],
    NOTKEYWORD: []
  },
  GENERAL: {
    ID: "GENERAL",
    SHIP: 8.5,
    EXTRA: 0,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.1,
    HVANCHOR: 500,
    NAME: "thông thường",
    NOTE: "Phí ship $8.5/kg",
    KEYWORD: [],
    NOTKEYWORD: []
  },
  UNKNOWN: {
    ID: "UNKNOWN",
    SHIP: 0,
    EXTRA: 0,
    PRICEEXTRA: 0,
    PRICEANCHOR: 0,
    HVEXTRA: 0.1,
    HVANCHOR: 500,
    NAME: "Chưa xác định",
    NOTE: "Phí ship tính theo cân nặng, sẽ được thông báo sau khi hàng về",
    KEYWORD: [],
    NOTKEYWORD: []
  }
};
const WEBSITES = {
  AMAZON3RD:{
    TAX: 0.083,
    MATCH: "amazon.com/gp/offer-listing",
    SILENCE: false,
    //COOKIE:"session-id=145-0181747-4095778; session-token=Y1mJ+P3eHpParb4TsuuNijPOisCg68nT0KcIo0qjgYiyErNXSpH1b/WILk1MsAepA9B1gzNC+2sHWf0OyK9NC/EYCk503FS7cqRM2pjv63Cy3p2HkMnAV4rMOnez+22Iev1N9Wi2lJsY5uyNxq/2LBaRq4/uKUGctUoe2ofX3eHVjPPodol2L+twTquBidvaCahHsJMmvY/ZEJGgRMuG6xdYFYzvUR229XMtQua4+BLSLBGnZPbCH7HKbMX3lyp9; ubid-main=130-5429414-6939308",
    PRICEBLOCK: [
      ".olpOfferPrice"
    ],
    SHIPPINGBLOCK: [
      ".olpShippingInfo"
    ]
  },  
  AMAZON: {
    TAX: 0.083,
    MATCH: "amazon.com",
    NAME: "Amazon",
    SILENCE: false,
    //COOKIE:"session-id=145-0181747-4095778; session-token=Y1mJ+P3eHpParb4TsuuNijPOisCg68nT0KcIo0qjgYiyErNXSpH1b/WILk1MsAepA9B1gzNC+2sHWf0OyK9NC/EYCk503FS7cqRM2pjv63Cy3p2HkMnAV4rMOnez+22Iev1N9Wi2lJsY5uyNxq/2LBaRq4/uKUGctUoe2ofX3eHVjPPodol2L+twTquBidvaCahHsJMmvY/ZEJGgRMuG6xdYFYzvUR229XMtQua4+BLSLBGnZPbCH7HKbMX3lyp9; ubid-main=130-5429414-6939308",
    DETAILBLOCK: [
      "#productDetails_detailBullets_sections1 tr",
      "#detailBulletsWrapper_feature_div li",
      "#detailBullets_feature_div span.a-list-item",
      "#prodDetails tr",
      "#detail-bullets .content li",
      "#technical-details-table tr",
      "#tech-specs-desktop tr"
    ],
    CATEGORYCONDITION: ["sellers rank"],
    WEIGHTCONDITION: ["weight" , "dimensions"],    
    PRICEBLOCK: [
      "#priceblock_dealprice",
      "#priceblock_ourprice",
      "#priceblock_saleprice",
      "#priceblock_pospromoprice",
      ".guild_priceblock_ourprice",
      ".offer-price",
      "#alohaPricingWidget .a-color-price",
      "#newPrice",
      
    ],
    REDIRECT:[
      "#availability a",
      "#alternativeOfferEligibilityMessaging_feature_div a"
    ],
    SHIPPINGBLOCK: [
      "#ourprice_shippingmessage"
    ]
  },
  AEROPOSTALE: {
    TAX: 0,
    MATCH: "aeropostale.com",
    NAME: "AeroPostale",
    SILENCE: false,
    PRICEBLOCK: [
      ".product-price .price-sale",
      ".product-price .price-msrp"
    ]
  },  
  BHPHOTOVIDEO: {
    TAX: 0,
    MATCH: "bhphotovideo.com",    
    NAME: "BHPhotoVideo",
    SILENCE: false,
    PRICEBLOCK: [
      ".ypYouPay",
      ".itc-you-pay .itc-you-pay-price"
    ]
  },
  CARTERS: {
    TAX: 0.083,
    MATCH: "carters.com",
    NAME: "Carters",
    SILENCE: false,
    PRICEBLOCK:[
      '.product-price-container .price-sales-usd'
    ]
  },
  CROCS:{
    TAX: 0.083,
    MATCH: "crocs.com",
    NAME: "Crocs",
    SILENCE: false,
    JSONBLOCK:{
      KEYWORD: "masterData",
      REGEX: /\{[.\s\S]+\}/gm,
      PATH: [
        "$..masterData.colors[?(@.isSale==true)].price",
        "$..masterData.colors[?(@.isSale==false)].price",
            ]
    } 
  },
  FOREVER21: {
    TAX: 0,
    MATCH: "forever21.com",
    NAME: "Forever21",
    SILENCE: false,
    JSONBLOCK:{
      SELECTOR:'script[type="application/ld+json"]',
      PATH: ["$.Offers.price"]
    } 
  },
      // Subdomain của GAP
      ATHLETA: {
        TAX: 0.083,
        MATCH: "athleta.gap.com",
        NAME: "Athleta",
        SILENCE: false,
        JSONBLOCK:{
          INDEX: 0,
          PATH: ["$[0].offers[0].price"]
        }
      },
      BANANAREPUBLIC: {
        TAX: 0,
        MATCH: "bananarepublic.gap.com",
        NAME: "BananaRepublic",
        SILENCE: false,
        JSONBLOCK:{
          INDEX: 0,
          PATH: ["$[0].offers[0].price"]
        }
      },
      HILLCITY: {
        TAX: 0.083,
        MATCH: "hillcity.gap.com",
        NAME: "HillCity",
        SILENCE: false,
        JSONBLOCK:{
          INDEX: 0,
          PATH: ["$[0].offers[0].price"]
        }
      },
      OLDNAVY: {
        TAX: 0.083,
        MATCH: "oldnavy.gap.com",
        NAME: "OldNavy",
        SILENCE: false,
        JSONBLOCK:{
          INDEX: 0,
          PATH: ["$.offers[0].price"]
        }
      },
  GAP: {
    TAX: 0.083,
    MATCH: "gap.com",
    NAME: "GAP",
    SILENCE: false,
    JSONBLOCK:{
      INDEX: 0,
      PATH: ["$[0].offers[0].price"]
    }
  },
  JOMASHOP: {
    SILENT: true,
    TAX: 0,
    MATCH: "jomashop.com",
    NAME: "JomaShop",
    SILENCE: false,
    COOKIE:"bounceClientVisit355v=N4IgNgDiBcIBYBcEQM4FIDMBBNAmAYnvgO6kB0AVgPYC2AhinFRGQMa1EICWKKVCAWmJ0ErOAIQAGABwBWACy4A7AEYVktZMllENMCAA0IAE4wQpYpVoMmLdjRABfIA; _vuid=d11ab39c-b372-43e3-ad8d-3617c5cb6d4e; D_HID=62B7A346-4058-3C77-8CB7-ED51A5943914; D_IID=A74F366D-F291-329B-8AE3-695F6EBA958A; D_SID=115.77.169.59:WASVmq9DjNjsYYd7Yje++3y4C70jD9sz5J1mpazEagA; D_UID=CDF9689C-0487-3CF1-80E9-F81FCB40B168; D_ZID=F7698C1E-15E4-32FF-807F-C52EA2BA8BF2; D_ZUID=862AEB79-2FF9-382C-B620-D920270D33BD; gateCpc=[%22first_cpc%22]; gateNonDirect=[%22first_cpc%22]; tracker_device=8e55fcc1-53aa-4815-8985-04a6011b9886;",
    JSONBLOCK:{
      SELECTOR: '#xitem-primary-json',
      INDEX: 0,
      PATH: ["$.price"]
    },
    CATEGORYBLOCK:[".breadcrumbs"]
  },
  NINEWEST: {
    TAX: 0.083,
    MATCH: "ninewest.com",
    SILENCE: false
  },
  OSHKOSH: {
    TAX: 0.083,
    MATCH: "oshkosh.com",
    NAME: "OshKosh",
    SILENCE: false,
    PRICEBLOCK:[
      '.product-price-container .price-sales-usd'
    ]
  },
  RILEYROSE: {
    TAX: 0.083,
    MATCH: "rileyrose.com",
    NAME: "RileyRose",
    SILENCE: false,
    JSONBLOCK:{
      INDEX: 29,
      PATH: ["$.Offers.price"]
    } 
  },
  SKIPHOP: {
    TAX: 0.083,
    MATCH: "skiphop.com",
    NAME: "SkipHop",
    SILENCE: false,
    PRICEBLOCK:[
      '.product-price-container .price-sales-usd'
    ]
  },
  THEBODYSHOP: {
    TAX: 0,
    MATCH: "thebodyshop.com",
    SILENCE: false,
    PRICEBLOCK:[
      '.current-price',
      '.price-wrapper'
    ]
  },
  WALGREENS: {
    TAX: 0.083,
    MATCH: "walgreens.com",
    SILENCE: false
  },
  WALMART: {
    TAX: 0,
    MATCH: "walmart.com",
    NAME: "Walmart",
    SILENCE: false,
    PRICEBLOCK: [
      ".prod-PriceHero .price-group"
    ]
  },
  ZARAUS:{
    TAX: 0,
    MATCH: "zara.com/us",
    NAME: 'Zara',
    SILENCE: false,   
    JSONBLOCK:{
      INDEX: 16,
      PATH: ["$[0].offers.price"]
    }
  },
  // ZARAES:{
  //   TAX: 0,
  //   RATE: 'EUR',
  //   MATCH: "zara.com/es",
  //   SILENCE: false,
  //   JSONBLOCK:{
  //     INDEX: 16,
  //     PATH: ["$[0].offers.price"]
  //   }
  // }
};

// Chuyển đổi dạng Number ra Currency: 1200000 => 1,200,000
Number.prototype.formatMoney = function(c, d, t) {
  var n = this,
    c = isNaN((c = Math.abs(c))) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c)))),
    j = (j = i.length) > 3 ? j % 3 : 0;
  return (
    s +
    (j ? i.substr(0, j) + t : "") +
    i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
    (c
      ? d +
        Math.abs(n - i)
          .toFixed(c)
          .slice(2)
      : "")
  );
};
// Đổi USD sang VND, làm tròn 5000
Number.prototype.toVND = function(rate){
  var priceNew = Math.ceil((this * rate) / 5000) * 5000; //Làm tròn lên 5000  
  return priceNew.formatMoney(0, '.', ',')+" VND"; // Thêm VND vào
};

// Check a string contain one of any string in Array
String.prototype.checkKeyword = function(include, exclude){
  if (include==undefined){
    return true;    
  }
  for (let i=0;i<include.length;i++) {
    if (this.includes(include[i])) {
      if (exclude !== undefined){
        for (let e=0;e<exclude.length;e++) {
          if (this.includes(exclude[e])) {
            return false;
          }
        }
      }
      return true;
    }
  }
  return false;
}
class Parser{
  constructor(dom){
    this.dom=dom;
  }
  // Lấy ra đoạn JSON từ thẻ <script type='application/ld+json'
  // Default sẽ lấy script đầu tiên, nếu cần lấy cái thứ n thì đổi index 
  // Lấy ra element theo JSONPath của web.JSONBLOCK
  getJSON(jsonblock){
    try{
      var selector='script';
      // Mặc định chỉ lấy JSON trong <script>, nếu cần lấy từ element khác thì phải thêm SELECTOR vào db
      if (jsonblock.SELECTOR!==undefined)
        selector = jsonblock.SELECTOR;
      var scriptBlock = select(this.dom, selector);
      if (scriptBlock === null) return "";
      var currentBlock;
      // Nếu web có <script> chứa JSON có index cố định thì set INDEX trong db để lấy đúng cái block[index] đó
      if (jsonblock.INDEX !==undefined && jsonblock.INDEX < scriptBlock.length){
        currentBlock = htmlparser.DomUtils.getText(scriptBlock[jsonblock.INDEX])
      }
      // Nếu web có <script> chứa JSON nằm bất kì thì phải dò bằng KEYWORD
      else if (jsonblock.KEYWORD !== undefined){
        for (let i=0;i<scriptBlock.length;i++){
          var tempBlock = htmlparser.DomUtils.getText(scriptBlock[i]);
          if (tempBlock.indexOf(jsonblock.KEYWORD)>=0){
            currentBlock = tempBlock;
            break;
          }
        }
      }
      else{
        // Mặc định lấy scriptBlock đầu tiên (thường dùng selector sẽ chỉ ra 1 block)
        currentBlock = htmlparser.DomUtils.getText(scriptBlock[0]);
      }
      // Nếu trong <script> ko phải JSON chuẩn thì phải dùng regex lấy phần JSON ra
      if (jsonblock.REGEX !== undefined){
        var matchhtml = currentBlock.match(jsonblock.REGEX);
        if (matchhtml.length>0)
          currentBlock = matchhtml[0];
      }
      //console.log(currentBlock);  
      var json = JSON.parse(currentBlock);
      // Có nhiều Path để lấy các trường hợp giá Sale/giá Thường có path khác nhau
      for (let i=0;i<jsonblock.PATH.length;i++){
        var query=jp.query(json,jsonblock.PATH[i]).toString();
        if (query!=="")
          return query;
      }
      //console.log(json);      
      return "";
    }
    catch(e){
      console.log(e);
      return "";
    }
  }

  // Lấy ra link href trong thẻ <a>
  getLink(blockElementArray, index = 0){
    try{
      
      for (let i = 0; i < blockElementArray.length; i++) {
        //console.log(blockElementArray[i]);         
        var link = select(this.dom, blockElementArray[i]);
        //console.log(link);
        if (link.length>index && link[index].name==='a') {
          //console.log(link[index]);
          return link[index].attribs.href;
        }
      }  
      return "";
    }
    catch(e){
      console.log(e);
      return "";
    }
  }
  // Lấy ra plain text từ array các block selector, default chỉ return 1 string đầu tiên
  getText(blockElementArray, index = 0){
    try{    
      for (let i = 0; i < blockElementArray.length; i++) {          
          var text = select(this.dom, blockElementArray[i]);
          //console.log(htmlparser.DomUtils.getText(text));
          if (text.length>index) {        
            return htmlparser.DomUtils.getText(text[index]);
          }
      }
      return "";
    }
    catch(e){
      console.log(e);
      return "";
    }
    
  }

  // Lấy ra array text từ 1 bảng <td> hoặc <li>
  getTextArray(blockElementArray){
    try{
      var textArray=[];
      for (let i = 0; i < blockElementArray.length; i++) {
        // Nguyên table data
        //console.log(blockElementArray[i]);
        var textTable = select(this.dom, blockElementArray[i]);  
        
        for (let e of textTable){
          if (e.type === "tag") {
            //row là 1 dòng gồm có 5 element: <td>Weight</td><td>$0.00</td>
            var row = e.children;
            try{
              var rowText=htmlparser.DomUtils.getText(row).replace(/\s+/gm," ")
                                                          .trim()
                                                          .toLowerCase();            
              textArray.push(rowText);
            }
            catch (err) {}
          }
        }
        if (textArray.length>0)
          return textArray;
      }    
      return null;
    }
    catch(e){
      console.log(e);
      return null;
    }
  }
}
class Category{
  constructor(){
    this.string = "";
    this.att = CATEGORIES["UNKNOWN"];
  }
  setCategory(detailArray, categoryCondition){
    var found=false;
    var catString="";
    var catType="GENERAL";     
    if (detailArray!== null){
      for (let i =0;i<detailArray.length;i++){
        if (detailArray[i].checkKeyword(categoryCondition)){ 
          catString=detailArray[i].replace(/\s{2,}|\..+ {.+}|see top 100|(amazon )?best sellers rank:?|#\d*,?\d*/gi, "|");
          found=true;        
          // Query từng KEYWORD trong category
          for (let cat in CATEGORIES) {
            if (
              catString.checkKeyword(
                CATEGORIES[cat].KEYWORD,
                CATEGORIES[cat].NOTKEYWORD
              ) === true
            ){
              catType = cat;            
              break;
            }          
          }
        }            
      }
    }
    if (found===false){
      catType= "UNKNOWN";
    }
    this.string= catString;
    this.att = CATEGORIES[catType];
  }    
}
class Weight{
  constructor(){ 
    this.string="";
    this.kg=0;
    this.unit="";
  }
  setWeight(detailArray, weightCondition){
    var current= "",
        kg= 0,
        unit= "";
    //console.log(detailArray);
    var reg = /(\d*,*\d+\.*\d*)( ounce| pound| oz)/; 
    if (detailArray!== null)
    for (let i = 0; i < detailArray.length; i++) {
      if (detailArray[i].checkKeyword(weightCondition)){
        var weightReg = detailArray[i].match(reg); // ["2.6 pound", "2.6", " pound", index: 16, input: "shipping weight	2.6 pounds"
        //console.log(weightReg);
        if (weightReg !== null) {
          var weightString = weightReg[0];
          var weight = parseFloat(weightReg[1]);
          var weightKg = weight;
          
          var weightUnit = weightReg[2];
          if (weightUnit.indexOf("ounce") >= 0 || weightUnit.indexOf("oz") >= 0)
            weightKg = weight / 35.274;
          else if (weightUnit.indexOf("pound") >= 0) weightKg = weight / 2.2;
          // Tìm weight lớn nhất
          if (
            kg < weightKg ||
            detailArray[i].indexOf("shipping weight") >= 0
          ) {
            current = weightString;
            kg = weightKg;
            unit = weightUnit;
          }
        }
      }
    }
    // Nếu tìm dc cân nặng thì làm tròn
    if (kg>0){
      // Làm tròn lên 0.1
      kg = Math.ceil(kg * 10) / 10;
      // Nếu nhỏ hơn 0.2kg thì làm tròn 0.2
      if (kg < 0.2) {kg=0.2};
    }
    
    this.string=current;
    this.kg=kg;
    this.unit=unit;

  }
}
class Price{
  constructor(){
    this.string = "";
    this.value = 0;
  }
  setPrice(priceString, reg){    
    var tempString = priceString.replace(/\s+/gm," ")
                                .trim().toLowerCase();
    this.string = tempString;
    tempString = tempString.replace(/\$\s*|.*free shipping.*/gm, "")
                                .replace(" ", ".");
    if (reg !== undefined){
        var tempMatch = tempString.match(reg)
        if (tempMatch!=null){
          tempString=tempMatch[0];
        }   
    } 
    var value = parseFloat(tempString);
    if (isNaN(value)){
      value = 0;
    }
    this.value = value;
  }
  static getPriceShipping(price, ship){
    return price.value + ship.value;
  }
}
class Website{
  constructor(url){    
    var found=false;
    var isUrl=false;
    var reg=/((?:(?:http|https):\/\/)?(?:\w*\.\w+\.\w+)(?:\.\w+)?)+([\w-;,.\/?%&=]*)?/i;
    var tempWeb = null;
    var tempUrl = "";
    var tempDomain="";
    var tempMatch = url.match(reg); 
    if (tempMatch!==null){
      isUrl=true;
      tempUrl = tempMatch[0]; // Lấy ra url trong đoạn text
      for (let i in WEBSITES){             
        if(tempMatch[0].indexOf(WEBSITES[i].MATCH)>=0){
          tempUrl = tempMatch[0]; // full url
          tempDomain = tempMatch[1]; // chỉ có domain
          if (tempDomain.indexOf('http')!==0)
            tempDomain="https://"+tempDomain;
          tempWeb = WEBSITES[i];
          break;
        }          
      }
    }
    if (tempWeb!==null){
      found = true;            
    }
    this.domain = tempDomain;  // chỉ có domain
    this.url=tempUrl;  // full url
    this.isUrl=isUrl; // true false
    this.att=tempWeb; // các thuộc tính của WEBSITES
    this.htmlraw="";
    this.found = found;
  }
  setDom(htmlraw){
    this.htmlraw=htmlraw;
  }
  static async getItem(website, recentitem){     
    var requestOptions = {
      url: website.url,
      gzip: true,
      jar: true,
      transform: function(body) {
        return cheerio.load(body);
      }
    };
    // var requestOptions = {
    //     method: "GET",
    //     url: website.url,
    //     gzip: true,
    //     jar: true
    // };
    // Nếu website cần Cookie thì set
    if (website.att.COOKIE !== undefined){
        var cookie = request.cookie(website.att.COOKIE);
        requestOptions.headers = {
            'Cookie' : cookie,
            'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
        };
    }
    request(requestOptions)
      .then($ => {
        website.$ = $;
        var item = new Item(website, recentitem);
        return item;
      })
      .catch(err => {
        console.log(err);
      });
    };
//     try {
//       const body = await request(requestOptions);
//       // Đưa html raw vào website
      
//       website.setDom(body);
//       var item = new Item(website, recentitem);
//       return item;
//     }
//     catch (err) {
//       console.log(err);
//       return null;
//     }
//  }
  static getAvailableWebsite(){
    var listweb = "";
    for (let web in WEBSITES){             
      if(WEBSITES[web].NAME !== undefined){
        listweb += WEBSITES[web].NAME + ", "
      }
    }
    listweb = listweb.substr(0, listweb.length-2);
    return listweb;
  }
  // Lấy ra đoạn JSON từ thẻ <script type='application/ld+json'
  // Default sẽ lấy script đầu tiên, nếu cần lấy cái thứ n thì đổi index 
  // Lấy ra element theo JSONPath của web.JSONBLOCK
  getJSON(jsonblock){
    try{
      var selector='script';
      // Mặc định chỉ lấy JSON trong <script>, nếu cần lấy từ element khác thì phải thêm SELECTOR vào db
      if (jsonblock.SELECTOR!==undefined)
        selector = jsonblock.SELECTOR;
      var scriptBlock = this.$(selector);
      if (scriptBlock === null) return "";
      var currentBlock;
      // Nếu web có <script> chứa JSON có index cố định thì set INDEX trong db để lấy đúng cái block[index] đó
      if (jsonblock.INDEX !==undefined && jsonblock.INDEX < scriptBlock.length){
        currentBlock = htmlparser.DomUtils.getText(scriptBlock[jsonblock.INDEX])
      }
      // Nếu web có <script> chứa JSON nằm bất kì thì phải dò bằng KEYWORD
      else if (jsonblock.KEYWORD !== undefined){
        for (let i=0;i<scriptBlock.length;i++){
          var tempBlock = htmlparser.DomUtils.getText(scriptBlock[i]);
          if (tempBlock.indexOf(jsonblock.KEYWORD)>=0){
            currentBlock = tempBlock;
            break;
          }
        }
      }
      else{
        // Mặc định lấy scriptBlock đầu tiên (thường dùng selector sẽ chỉ ra 1 block)
        currentBlock = htmlparser.DomUtils.getText(scriptBlock[0]);
      }
      // Nếu trong <script> ko phải JSON chuẩn thì phải dùng regex lấy phần JSON ra
      if (jsonblock.REGEX !== undefined){
        var matchhtml = currentBlock.match(jsonblock.REGEX);
        if (matchhtml.length>0)
          currentBlock = matchhtml[0];
      }
      //console.log(currentBlock);  
      var json = JSON.parse(currentBlock);
      // Có nhiều Path để lấy các trường hợp giá Sale/giá Thường có path khác nhau
      for (let i=0;i<jsonblock.PATH.length;i++){
        var query=jp.query(json,jsonblock.PATH[i]).toString();
        if (query!=="")
          return query;
      }
      //console.log(json);      
      return "";
    }
    catch(e){
      console.log(e);
      return "";
    }
  }

  // Lấy ra link href trong thẻ <a>
  getLink(blockElementArray, index = 0){
    try{
      
      for (let i = 0; i < blockElementArray.length; i++) {
        //console.log(blockElementArray[i]);         
        var link = this.$(blockElementArray[i]);
        //console.log(link);
        if (link.length>index && link[index].name==='a') {
          //console.log(link[index]);
          return link[index].attribs.href;
        }
      }  
      return "";
    }
    catch(e){
      console.log(e);
      return "";
    }
  }
  // Lấy ra plain text từ array các block selector, default chỉ return 1 string đầu tiên
  getText(blockElementArray, index = 0){
    try{    
      for (let i = 0; i < blockElementArray.length; i++) {          
          var text = this.$(blockElementArray[i]).text();
          //console.log(htmlparser.DomUtils.getText(text));
          if (text.length>index) {        
            return text;
          }
      }
      return "";
    }
    catch(e){
      console.log(e);
      return "";
    }
    
  }

  // Lấy ra array text từ 1 bảng <td> hoặc <li>
  getTextArray(blockElementArray){
    try{
      var textArray=[];
      for (let i = 0; i < blockElementArray.length; i++) {
        // Nguyên table data
        //console.log(blockElementArray[i]);
        var textTable = this.$(blockElementArray[i]);  
        
        for (let e of textTable){
            //row là 1 dòng gồm có 5 element: <td>Weight</td><td>$0.00</td>
          console.log(e);
          var row = e.children;
          try{
            var rowText=htmlparser.DomUtils.getText(row).replace(/\s+/gm," ")
                                                        .trim()
                                                        .toLowerCase();            
            textArray.push(rowText);
          }
          catch (err) {}
        }
        if (textArray.length>0)
          return textArray;
      }    
      return null;
    }
    catch(e){
      console.log(e);
      return null;
    }
  }
}
class Item{
  constructor(website, recentitem){    
      var price=new Price();
      // Tìm giá trên HTML (có priceBlock)
      if (website.att.PRICEBLOCK!==undefined){
        var priceString = website.getText(website.att.PRICEBLOCK);
        console.log(priceString);
        price.setPrice(priceString);          
      }
      // Tìm giá trên JSON (ko có priceBlock, chỉ có JSONBlock)
      else if (website.att.JSONBLOCK!==undefined){
        var priceString = website.getJSON(website.att.JSONBLOCK); 
        price.setPrice(priceString);
      }

      var shipping=new Price();
      if (website.att.SHIPPINGBLOCK!==undefined){
        var shippingString = website.getText(website.att.SHIPPINGBLOCK);
        var regShipping=/\d+.?\d*/gm;
        shipping.setPrice(shippingString, regShipping);
      }

      var redirect="";
      if (website.att.REDIRECT!==undefined){
        var newurl = website.getLink(website.att.REDIRECT);
        console.log(newurl);
        if (newurl!=="")
          redirect = website.domain + newurl;            
      }

      var weight = new Weight();
      var category=new Category();

      // recentitem chỉ có khi vào trang redirect rồi
      if (recentitem!==undefined){ 
        // Nếu đã có thông tin ở trang trước thì ko cần lấy thông tin ở trang redirect
        if (recentitem.weight.kg!==0)
          weight = recentitem.weight;
        if (recentitem.category.string!==0)
          category = recentitem.category;
      }
      // Nếu cần lấy Category & Weight từ chung 1 data table thì define DETAILBLOCK
      else if (website.att.DETAILBLOCK!==undefined){
        // detailArray gồm nhiều row trong table chứa Detail
        var detailArray = website.getTextArray(website.att.DETAILBLOCK);
        weight.setWeight(detailArray,website.att.WEIGHTCONDITION);          
        category.setCategory(detailArray, website.att.CATEGORYCONDITION); 
      }
      else{ // các trang thông thường sẽ có category nằm riêng, weight nằm riêng
        if (website.att.CATEGORYBLOCK!==undefined){
          var categoryString = website.getTextArray(website.att.CATEGORYBLOCK);
          category.setCategory(categoryString); 
        }
        if (website.att.WEIGHTBLOCK!==undefined){
          var weightString = website.getTextArray(website.att.WEIGHTBLOCK);
          weight.setWeight(weightString); 
        }
      }
      this.weburl = website.url;
      this.webatt = website.att; // Thuế tại Mỹ của từng web

      //console.log(price);
      this.price=price; // Giá item
      this.shipping=shipping; // Giá ship của web
      this.priceshipping= Price.getPriceShipping(price, shipping); // Tổng giá item và ship

      //console.log(redirect);
      this.redirect=redirect;
      this.weight=weight;          
      this.category=category; 

      this.total =  this.calculatePrice();
      this.totalString=(this.total===0?"":this.toVND(this.total));;      
  } 
  setPrice(price){
    this.price=price; // Giá item
  }
  setShipping(shipping){
    this.shipping=shipping;
  }
  calculatePrice(){
    var itemPrice = this.priceshipping;
    var itemTax = itemPrice * this.webatt.TAX; // Thuế tại Mỹ
    var itemPriceAfterTax = itemPrice + itemTax; // Giá Sau Thuế
    //console.log("tax: " + itemTax + " (" + this.webatt.TAX * 100 + "%)");
  
    var itemMoon = itemPriceAfterTax * (itemPriceAfterTax < 300 ? 0.07 : 0.05); // Công mua tính theo Giá Sau Thuế
    //console.log("moon: " + itemMoon);
  
    var itemWeight = this.weight.kg;
    var itemShip = itemWeight * this.category.att.SHIP; // Giá ship theo cân nặng
    //console.log("ship: $" + this.category.att.SHIP + "/kg x " + itemWeight + "kg");
  
    var itemPriceExtra = this.category.att.EXTRA +
      (itemPrice >= this.category.att.PRICEANCHOR
        ? this.category.att.PRICEEXTRA
        : 0); /// Phụ thu theo cái
    //console.log("extra: " + category.att.EXTRA);
  
    var itemHVEXTRA =
      itemPrice *
      (itemPrice >= this.category.att.HVANCHOR
        ? this.category.att.HVEXTRA
        : 0); // Phụ thu giá trị cao (HVANCHOR)
    //console.log("high price extra: " + itemHVEXTRA);
  
    var itemTotal =
      itemPrice > 0
        ? itemPriceAfterTax + itemMoon + itemShip + itemPriceExtra + itemHVEXTRA
        : 0;
    //console.log("total: " + itemTotal);
    return itemTotal;
  }
  // Xuất log gồm log.type (error/success) và log.content dạng string
  toLog(){
    let logContent =`
URL : ${this.weburl}
PRICE : ${this.price.string}
SHIPPING : ${this.shipping.value} ~ ${this.shipping.string}
WEIGHT : ${this.weight.string} ~ ${this.weight.kg}kg
CATEGORY : ${this.category.att.ID}
TOTAL : ${this.totalString}
CATEGORYSTRING : ${this.category.string}`;
    let logType='success';
    if (this.webatt.DETAILBLOCK!== undefined){
      if (this.weight.kg===0 || this.category.att.ID ==="UNKNOWN")
      logType='error';
    }
    if (this.price.value===0)
      logType='error';
    let log = {
      content: logContent,
      type: logType
    }
    console.log(logContent);
    return log;
  }
  // Xuất ra string báo giá và chú thích
  toText(){
    var response;
    // Nếu ko xác định dc giá
    if (this.totalString ==""){
      response= "Ko xác định được giá sản phẩm. Vui lòng chat với Moon để được báo giá chính xác."
    }
    else{
      var itemTitle, itemSubtitle;
      itemTitle='Giá dự kiến: ' + this.totalString+".";
      // Nếu ko có cân nặng và thuộc danh mục có ship,hoặc ko có danh mục (unknown) thì thông báo "cân sau"
      if ((this.weight.kg===0 && this.category.att.SHIP!==0) || this.category.att.ID==='UNKNOWN'){
        itemSubtitle = ' Phí ship tính theo cân nặng, sẽ được thông báo sau khi hàng về.';
      }
      else{
        itemSubtitle = ' Đã bao gồm ' + this.category.att.NOTE + ' mặt hàng ' + this.category.att.NAME + '.';     
      };
      response = itemTitle+itemSubtitle;
    }
    return response;
  }
  
  // Xuất ra json theo format response của FB
  // Dùng để auto reply
  // badgeImageUrl là hình cover của response
  toFBResponse(badgeImageUrl){  
    var response;
    // Nếu ko xác định dc giá
    if (this.totalString ==""){
      response= {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Ko xác định được giá sản phẩm",
              "image_url": badgeImageUrl,
              "buttons": [
                {
                  "type": "postback",
                  "payload": "chat",
                  "title": "Chat với Moon",
                }
              ],
            }]
          }
        }
      }
    }
    else{
      var itemTitle, itemSubtitle;      
      itemTitle='Giá tham khảo: ' + this.totalString;
      // Nếu ko có cân nặng và thuộc danh mục có ship,hoặc ko có danh mục (unknown) thì thông báo "cân sau"
      if ((this.weight.kg===0 && this.category.att.SHIP!==0) || this.category.att.ID==='UNKNOWN'){
        itemSubtitle = 'Phí ship tính theo cân nặng, sẽ được thông báo sau khi hàng về';
      }
      else{
        itemSubtitle = 'Đã bao gồm ' + this.category.att.NOTE + ' mặt hàng ' + this.category.att.NAME;     
      };
      response =  {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": itemTitle,
              "subtitle": itemSubtitle,
              "image_url": badgeImageUrl,
              "buttons": [
                {
                  "type": "postback",
                  "payload": "chat",
                  "title": "Chat với Moon",
                }
              ],
            }]
          }
        }
      }      
    }
    return response;
  }
  // Xuất ra json theo format response của FB
  // Dùng để gửi admin duyệty
  // gửi thông tin báo giá kèm theo button cho phép trả lời nhanh
  toFBAdmin(senderid,sendername){  
    var response;
    let responseContent =`${sendername} gửi link ${this.weburl}
- Giá web: ${this.price.string}`;
    if (this.shipping.value>0) {
    responseContent += `
- Ship: ${this.shipping.value}`;
    }
    if ((this.weight.kg===0 && this.category.att.SHIP!==0) || this.category.att.ID==='UNKNOWN'){
      responseContent += "\n- Chưa có cân nặng";
    }
    else
      responseContent += `
- Cân: ${this.weight.kg}kg
- Mặt hàng ${this.category.att.NAME}`;
    let payloadContent_1=`send|${senderid}|Dạ giá sp này là ${this.totalString}`;
    let payloadContent_2=`send|${senderid}|Cái này là ${this.totalString}`;
    response =  {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type":"button",
          "text":responseContent,
          "buttons":[
            {
              "type":"postback",
              "payload": payloadContent_1,
              "title": "Dạ, " + this.totalString
            },
            {
              "type":"postback",
              "payload": payloadContent_2,
              "title": "Cái này " + this.totalString
            }
          ]
        }
      }
    }  
    return response;
  }
  // chuyển giá (float)price sang VND theo RATE, thêm đơn vị VND
  toVND(price){    
    var rate=this.webatt.RATE!==undefined?RATE[this.webatt.RATE]:RATE['USD'];
    var priceNew = Math.ceil((price * rate) / 5000) * 5000; //Làm tròn lên 5000 
    return priceNew.formatMoney(0, ',', '.')+"đ"; // Thêm VND vào
  }
}
module.exports.Website=Website;