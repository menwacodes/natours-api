const login = async (email, password) => {
    // console.log(email, password); https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js

    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:3000/api/v1/users/login',
            data: {email, password}
        });
        console.log(res);
    } catch (e) {
        console.error(e.response.data);
    }

};

document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
});
