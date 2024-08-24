class StringUtil{

    static isUpperCase(str) {
        let c = str.charCodeAt(0);
        return (c >= 65 && c <= 90) || c == 209 || c == 199;
    }

    static isLowerCase(str) {
        let c = str.charCodeAt(0);
        return (c >= 97 && c <= 122) || c == 241 || c == 231;
    }

    static isUTF8(str){
        return !(str.normalize("NFD").match(/[\u0300-\u036f]/g) == null);
    }

    static toASCII(str){
        return str == "´" ? "" : str.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    }

}

class MainController{

    static UPPERCASE_WARNING = `No se admite caracteres en mayúscula. Se cambio automáticamente a minúscula.`;
    static UTF8_WARNING = `No se admiten caracteres en UTF-8.`;
    static GENERIC_WARNING = `La entrada contenía caracteres no validos que fueron eliminados.`;

    isDecodeModeEnabled = false;

    link = document.createElement("a");
    file = document.createElement("input");
    reader = new FileReader();
    dummy_event = new Event("DUMMY_EVENT");

    forbidden_popup = document.getElementById("forbidden_popup");
    popup_text = document.querySelector("#forbidden_popup h2");

    main_cntr = document.querySelector("#main_container");
    input_tf = document.querySelector("#input_container .text_field");
    output_tf = document.querySelector("#output_container .text_field");

    input_btn = document.querySelector("#input_btn");
    output_btn = document.querySelector("#output_btn");
    swap_btn = document.querySelector("#swipe-btn");

    open_btn = document.getElementById("open_btn");
    save_btn = document.getElementById("save_btn");
    undo_btn = document.getElementById("undo_btn");

    constructor(){
        this.file.type = "file";
        this.file.accept = ".txt";

        this.swap_btn.addEventListener('click', e => this.changeWorkMode());
        this.input_btn.addEventListener('click', e => this.handleInputBtnEvent());
        this.output_btn.addEventListener('click', e => this.handleOutputBtnEvent());

        this.input_tf.addEventListener('input', e => this.encodeInput(e));
        this.input_tf.addEventListener('keydown', e => this.validateReplace(e));

        this.open_btn.addEventListener('click', e => this.file.click());
        this.file.addEventListener('change', e => this.openFile(e));
        this.save_btn.addEventListener('click', e => this.saveFile());
    }

    changeWorkMode(){

        (this.isDecodeModeEnabled = !this.isDecodeModeEnabled) ? this.main_cntr.classList.add("reverse") : this.main_cntr.classList.remove("reverse");
        [this.input_btn.innerHTML, this.output_btn.innerHTML] = [this.output_btn.innerHTML, this.input_btn.innerHTML]; 

        this.input_tf.disabled = this.isDecodeModeEnabled;
        this.output_tf.disabled = !this.isDecodeModeEnabled;

    }

    clearInputs(){
        this.input_tf.value = "";
        this.output_tf.value = "";
    }

    async clipboardCopy(tf){
        await navigator.clipboard.writeText(tf.value);
    }

    async clipboardPaste(tf){
        await navigator.clipboard.readText().then(text => tf.value = text);
    }

    displayPopup(msg){
        clearTimeout(this.timeout_id);
        this.popup_text.innerHTML = msg;
        this.forbidden_popup.style.opacity = 1;
        this.timeout_id = setTimeout(() => this.forbidden_popup.style.opacity = 0, 2000);
    }

    encodeInput(e){

        if(e.inputType == "insertText" || e.inputType == "insertFromComposition"){

            let s = e.data;

            if (s.length > 1){
                this.encodeInput(this.dummy_event);
            }

            if(s == " "){
                this.output_tf.value += s;
                return;
            }

            if(StringUtil.isUpperCase(s)){
                this.displayPopup(MainController.UPPERCASE_WARNING);
                e.target.value = e.target.value.toLowerCase();
                s = s.toLowerCase();
            }

            if(StringUtil.isLowerCase(s)){
                this.output_tf.value += this.getEncodedVowel(s);
                return;
            }

            if(StringUtil.isUTF8(s)){
                this.displayPopup(MainController.UTF8_WARNING);
                s = StringUtil.toASCII(s)
                e.target.value = e.target.value.replace(e.data,s);
                this.output_tf.value += this.getEncodedVowel(s);
                return;
            }

            e.target.value = e.target.value.replace(s,"")
            this.displayPopup(`No se admite el caracter [ ${s} ]`)
            return;

        }

        if (e.inputType == "insertCompositionText"){
            e.target.value = e.target.value.replace("´","")
            if(e.data.length == 1){
                return;
            }
        }

        if (e.inputType == "deleteCompositionText"){
            return;
        }

        let containsInfrigments = false;
        let chars = this.input_tf.value.split("");
        this.input_tf.value = "";
        this.output_tf.value = "";

        for (let s of chars){

            if(!this.isValid(s)){
                containsInfrigments = true;
                s = StringUtil.isUTF8(s) ? StringUtil.toASCII(s) : (StringUtil.isUpperCase(s) ? s.toLowerCase() : "");
            }

            this.input_tf.value += s;
            this.output_tf.value += this.getEncodedVowel(s);

        }

        if(containsInfrigments){
            this.displayPopup(MainController.GENERIC_WARNING);
        }

    }

    getEncodedVowel(v){
        switch (v){
            case 'e': return 'enter';
            case 'i': return 'imes';
            case 'a': return 'ai';
            case 'o': return 'ober';
            case 'u': return 'ufat';
            default : return v;
        }
    }

    handleInputBtnEvent(){
        this.isDecodeModeEnabled ? this.clipboardCopy(this.input_tf) : this.clipboardPaste(this.input_tf);
    }

    handleOutputBtnEvent(){
        !this.isDecodeModeEnabled ? this.clipboardCopy(this.output_tf) : this.clipboardPaste(this.output_tf);
    }

    isValid(str){
        return str == " " || StringUtil.isLowerCase(str);
    }

    openFile(e){
        let file = e.target.files[0];

        if(!file){
            return;
        }

        this.reader.onload = e => {
            (!this.isDecodeModeEnabled ? this.input_tf : this.output_tf).value = e.target.result;
        };

        this.reader.readAsText(file);
    }

    saveFile(){

        let file = ""
        let tf = undefined;

        if (this.isDecodeModeEnabled){
            file = `TextoDesencriptado${Date.now()}.txt`
            tf = this.input_tf;
        }else{
            file = `TextoEncriptado${Date.now()}.txt`
            tf = this.output_tf;
        }

        this.link.href = URL.createObjectURL(new Blob([tf.value], { type: "text/plain" }));
        this.link.download = file;
        this.link.click();

    }

    validateReplace(e){
        
        if(e.key.startsWith("Arrow")){
            return;
        }

        if(this.input_tf.selectionEnd - this.input_tf.selectionStart != 0){
            e.preventDefault();
        }
    }

}

new MainController();