//Assuming this input will always produce a result lesser than Number.MAX_SAFE_INTEGER.

var sum_to_n_a = function(n) {
    if (n < 0) {
        return null;
    }
    //iterative solution
    let result = 0;
    for (var i = 1; i <= n; i++) {
        result += i;
    }
    return result;
};

var sum_to_n_b = function(n) {
    if (n < 0) {
        return null;
    }
    //sum to n math: sum(n) = n*(n+1)/2
    return n * (n + 1) / 2;
};

var sum_to_n_c = function(n) {
    if (n < 0) {
        return null;
    }
    //recursive solution
    if(n == 1){
        return 1;
    }
    return n + sum_to_n_c(n - 1);
};

console.log(sum_to_n_a(3)); // 55
console.log(sum_to_n_b(3)); // 55
console.log(sum_to_n_c(3)); // 55