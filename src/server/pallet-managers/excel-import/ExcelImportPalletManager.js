const  { PalletManager } = require('../PalletManager');
const { isNull } = require('util');

class ExcelImportPalletManager extends PalletManager {

    constructor(RED, palletConfig, node){
        super(RED, palletConfig, node);

        this._self.config = palletConfig;
        this._self.palletType = 'import';

        this.onInput = this.onInput.bind(this._self);

    }
    

    onInput(msg){

        const {sheetname, file } = msg.payload;
        var errorMsg = "";

        const ExcelJS = require('exceljs');
        const { assert, Console } = require('console');
        
        const workbook = new ExcelJS.Workbook();         

        
        const getExcelData = async() =>{
            const json = await excelToJSON();
            return json
        }
        
        const excelToJSON = async() => {
            await workbook.xlsx.readFile(file);
    
            let jsonarray = [];
            let sheetBOM = null;
        
            workbook.eachSheet(function(worksheet, sheetId) {
                if (worksheet.name == sheetname){
                    sheetBOM = worksheet;
                }
            });
    
            if (sheetBOM == null){
                errorMsg = "BOM sheet not found!";
                this._processError(errorMsg);
            } else {
                sheetBOM.eachRow(function (row, rowNumber){
                    jsonarray.push(row.values);
                })
                filter(jsonarray);
                return jsonarray;
            }
        };


        function filter(obj) {
            var index=0;
            for (index = obj.length-1; index >=0; index -=1){
                if (Object.prototype.toString.call(obj[index]) === '[object Array]') {
                    obj[index].shift();
                    if (!(isNaN(obj[index][1])) && (obj[index].length !== 10)){
                        obj.splice(index,1);
                    }
                }  
            }
        }

        
        (async() => {

            try {
                let exceldata = await getExcelData(file);
                if (exceldata === null || typeof exceldata === 'undefined'){
                    msg.payload = errorMsg;
                    this.send([null,msg]);
                } else {
                    let excelJSON = {"bom":exceldata};
                    this._extendMsgPayload(msg, excelJSON);
                    this.send([msg, null]);
                }
            } catch (error) {
                this._processError(error);
                this.error(error);
                msg.payload = errorMsg;
                this.send([null,msg]);
            }
        })();


    }

}

module.exports = { ExcelImportPalletManager };