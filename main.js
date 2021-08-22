function Validator(options) {
    
    // Get Parent Element
    function getParent(element,selector){
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }


    // Object seclectorRules
    var selectorRules = {};

    // Hàm thực hiện validate
    function validate(inputElement,rule) {
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage; //= rule.test(inputElement.value);
        

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        // Lặp qua từng rule và kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; ++i){
            switch (inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](inputElement.value);
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }
        if(errorMessage)
        {
            errorElement.innerText = errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid');
        }
        else {
            errorElement.innerText = '';
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
        }
        return !errorMessage;
    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    if (formElement)
    {
        // Khi submit form
        formElement.onsubmit = function(e){
            e.preventDefault();
            var isFormValid = true;
            // Lặp qua từng rule và validate
            options.rules.forEach(function (rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement,rule); 
                if (!isValid) isFormValid = false;  
            });

            
            if (isFormValid){

                // Trường hợp Submid với js
                if (typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function(values,input){

                        switch (input.type) {
                            case 'radio':
                            case 'checkbox':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked')

                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        
                        return  values;
                    }, {});
                    options.onSubmit(formValues);
                }
                // Trường hợp submid với hành vi mặc định
                else {
                    formElement.submit();
                }
            }
            
        }

        // Lặp qua mỗi rule và xử lí (lắng nghe sự kiện)
        options.rules.forEach(function (rule){
            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }
            else {
                selectorRules[rule.selector] = [rule.test]; 
            }
            
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement){
                if (inputElement){
                    //Xử lí trường hợp blur khỏi input
                    inputElement.onblur = function (){
                        //value: inputElement.value
                        //test func = rule.test
                        validate(inputElement,rule);  
                    }
    
                    // Xử lí mỗi khi người dùng nhập vào input
                    inputElement.oninput = function() {
                        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
                        errorElement.innerText = '';
                        getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
                    }
                }
            })
            
        });
    }
    // console.log(selectorRules);
    
}
// Định nghĩa của rule;
// Nguyên tắc của rule
// 1. Khi có lỗi => Trả ra mess lỗi
// 2. Không có lỗi => Trả ra undefined
Validator.isRequired = function (selector,message){
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này' ;
        }
    }
}

Validator.isEmail = function (selector,message){
    return {
        selector: selector,
        test: function (value){
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}


Validator.minLength = function (selector, min,message){
    return {
        selector: selector,
        test: function (value){
            return value.length >= min ? undefined : message || 'Vui lòng nhập tối thiểu ' + min + ' ký tự';
        }
    }
}



Validator.isConfirmed = function (selector, getConfirmValue,message){
    return {
        selector: selector,
        test: function (value){
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}



