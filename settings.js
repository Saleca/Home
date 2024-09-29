fetch('settings.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('settings').innerHTML = data;
            })
            .catch(error => console.error('Error fetching settings:', error));
