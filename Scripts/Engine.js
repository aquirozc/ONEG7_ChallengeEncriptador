class StringUtil{

    static vowels_code = [97, 101, 105, 111, 117]

    static isUpperCase(str) {
        let c = str.charCodeAt(0);
        return c >= 65 && c <= 90;
    }

    static isLowerCase(str) {
        let c = str.charCodeAt(0);
        return c >= 97 && c <= 122;
    }

    static isVowel(str){
        return this.vowels_code.includes(str.charCodeAt(0));
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

    displayPopup(){
        clearTimeout(this.timeout_id);
        this.forbidden_popup.style.opacity = 1;
        this.timeout_id = setTimeout(() => {
            this.forbidden_popup.style.opacity = 0;
            this.popup_text.innerHTML = "";
            }, 2000
        );
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

        if(e.inputType == "insertText"){

            let s = e.data;

            if(s == " "){
                this.output_tf.value = this.output_tf.value + s;
                return;
            }

            if(StringUtil.isUpperCase(s)){
                e.target.value = e.target.value.toLowerCase();
                this.popup_text.innerHTML = `No se admite caracteres en mayuscula. Se cambio automaticamente a minuscula`
                this.displayPopup();
                s = s.toLowerCase();
            }

            if(StringUtil.isLowerCase(s)){

                if(StringUtil.isVowel(s)){
                    s = this.getEncodedVowel(s);
                }

                this.output_tf.value += s;
                return;
            }

            e.target.value = e.target.value.replace(s,"")
            this.popup_text.innerHTML = `No se admite el caracter [ ${s} ]`
            this.displayPopup()
            return;

        }

        let isOk = true;
        let chars = this.input_tf.value.split("");

        for(let i = 0; i < chars.length;i++){
            if(!this.isValid(chars[i])){
                chars[i] = ""
                isOk = false;
            }
        }

        chars.filter(c => c != "")
        this.input_tf.value = chars.join("");

        chars = chars.map(c => this.getEncodedVowel(c));
        this.output_tf.value = chars.join("");

        if (!isOk){
            this.popup_text.innerHTML = `La entrada contenía caracteres no validos que fueron eliminados`;
            this.displayPopup()
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