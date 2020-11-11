/**
 * Helper function that parces any error the Beep API returns
 * This parcer for errors was introduced to allow us to parse form validation errors
 *
 * @param error error from the rest api that needs to be parsed before user sees it in Alert()
 * @returns string that will display nicely in native Alert()
 */
export function parseError(validatorError: string | any) {  
    if ((typeof validatorError) == "string") {
        return validatorError; 
    }

    let output = "";  

    Object.keys(validatorError).forEach(function (item) {  
        output += "\n" + validatorError[item].message;  
    });  

    return output.substr(1, output.length);  
}

/**
 * Handle fetch errors 
 *
 * @param error is the native fetch error
 * @returns false so I can throw this is the isLoading setState
 */
export function handleFetchError(error: any) {
    const message = "[API] Fetch Error:";
    console.log(message, error);
    alert(error);
    return false;
}

/**
 * When we run fetches in our app, we use this to handle any status code error
 *
 * @param response is the fetch response
 * @returns false so I can throw this is the isLoading setState
 */
export function handleStatusCodeError(response: any) {
    const message = `[API] The Beep API returned status code ${response.status}:`;
    console.log(message, response);
    //alert(`The Beep API returned status code ${response.status}. We are very sorry for this. Please try again later!`);
    response.json().then((data: any) => alert(parseError(data.message))).catch((error: any) => alert(error));
    return false;
}
