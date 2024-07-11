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

    timeout_id = 0;
    link = document.createElement("a");
    file = document.createElement("input");
    reader = new FileReader()
    dummy_event = new Event("NO_TYPE");

    input_tf = document.querySelector("#input_container .text_field");
    output_tf = document.querySelector("#output_container .text_field");

    forbidden_popup = document.getElementById("forbidden_popup");
    popup_text = document.querySelector("#forbidden_popup h2");

    open_btn = document.getElementById("open_btn");
    save_btn = document.getElementById("save_btn");

    constructor(){
       this.file.type = "file";
       this.file.accept = ".txt";

       this.input_tf.addEventListener('input', e => this.validateInput(e));
       this.open_btn.addEventListener('click', e => this.file.click());
       this.save_btn.addEventListener('click',e => this.saveFile());

       this.file.addEventListener('change', e => this.openFile(e));
    }

    displayPopup(msg){
        clearTimeout(this.timeout_id);
        this.popup_text.innerHTML = msg;
        this.forbidden_popup.style.opacity = 1;
        this.timeout_id = setTimeout(() => this.forbidden_popup.style.opacity = 0, 2000);
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

    validateInput(e){

        if(e.inputType == "insertText" || e.inputType == "insertFromComposition"){

            let s = e.data;

            if(s == " "){
                this.output_tf.value = this.output_tf.value + s;
                return;
            }

            if(StringUtil.isUpperCase(s)){
                e.target.value = e.target.value.toLowerCase();
                this.displayPopup(`No se admite caracteres en mayuscula. Se cambio automaticamente a minuscula`);
                s = s.toLowerCase();
            }

            if(StringUtil.isLowerCase(s)){
                this.output_tf.value += this.getEncodedVowel(s);
                return;
            }

            if(StringUtil.isUTF8(s)){
                let ss = StringUtil.toASCII(s)
                e.target.value = e.target.value.replace(s,ss);
                this.displayPopup("No se admiten caracteres en UTF-8");
                s = ss;
                this.output_tf.value += this.getEncodedVowel(s);
                return;
            }

            e.target.value = e.target.value.replace(s,"")
            this.displayPopup(`No se admite el caracter [ ${s} ]`)
            return;

        }

        if (e.inputType == "insertCompositionText"){
            e.target.value = e.target.value.replace("´","")
            return;
        }

        if (e.inputType == "deleteCompositionText"){
            return;
        }

        let isOk = true;
        let chars = this.input_tf.value.split("");

        for(let i = 0; i < chars.length;i++){
            if(!this.isValid(chars[i])){
                chars[i] = StringUtil.isUTF8(chars[i]) ? StringUtil.toASCII(chars[i]) : "";
                isOk = false;
            } else if(StringUtil.isUpperCase(chars[i])){
                chars[i] = chars[i].toLowerCase();
                isOk = false;
            }
        }

        chars.filter(c => c != "")
        this.input_tf.value = chars.join("");

        chars = chars.map(c => this.getEncodedVowel(c));
        this.output_tf.value = chars.join("");

        if (!isOk){
            this.displayPopup(`La entrada contenía caracteres no validos que fueron eliminados`);
        }

    }

    isValid(str){
        return str == " " || StringUtil.isLowerCase(str.toLowerCase());
    }

    openFile(e){
        let file = e.target.files[0];

        if(!file){
            return;
        }

        this.reader.onload = e => {
            this.input_tf.value = e.target.result;
            this.validateInput(this.dummy_event);
        };

        this.reader.readAsText(file);
    }

    saveFile(){
        this.link.href = URL.createObjectURL(new Blob([this.output_tf.value], { type: "text/plain" }));
        this.link.download = "TextoEncriptado.txt";
        this.link.click();
    }
    
}

    


new MainController();