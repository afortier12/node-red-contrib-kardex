const  { PalletManager } = require('../PalletManager');
const { isNull } = require('util');

class ExcelImportPalletManager extends PalletManager {

    constructor(RED, palletConfig, node){
        super(RED, palletConfig, node);

        this._self.filename = palletConfig.filename;
        this._self.sheetname = palletConfig.sheetname;
        this._self.config = palletConfig;
        this._self.palletType = 'import';

        this.onInput = this.onInput.bind(this._self);

    }
    
    set filename(name) {
        this._self.filename= name;
    }
    
    get filename() {
        return this._self.filename;
    }

    set sheetname(name) {
        this._self.sheetname = name;
    }

    get sheetname() {
        return this._self.sheetname;
    }

    onInput(msg){

        const { filename, sheetname } = this;

        const ExcelJS = require('exceljs');
        const { assert, Console } = require('console');
        
        const workbook = new ExcelJS.Workbook();         

        
        const getExcelData = async() =>{
            const json = await excelToJSON();
            return json
        }
        
        const excelToJSON = async() => {
            await workbook.xlsx.readFile(filename);
    
            let jsonarray = [];
            let sheetBOM = null;
        
            workbook.eachSheet(function(worksheet, sheetId) {
                if (worksheet.name == sheetname){
                    sheetBOM = worksheet;
                }
            });
    
            if (sheetBOM == null){
                this._processError("BOM sheet not found!");
            } else {
                sheetBOM.eachRow(function (row, rowNumber){
                    jsonarray.push(row.values);
                })
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
                let excelJSON = await getExcelData(filename);
                filter(excelJSON);
                this._extendMsgPayload(msg, excelJSON);
                this.send(msg);
            } catch (error) {
                this._processError(error);
                this.error(error);
            }
        })();


    }

}

module.exports = { ExcelImportPalletManager };