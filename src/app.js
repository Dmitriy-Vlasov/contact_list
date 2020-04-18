import './reset.css';
import './venderCSS/skeleton.css';
import './style.css';
import anime from 'animejs/lib/anime.es.js';

// DOM-элементы
const addContactButton = document.querySelector('.addContact');
const popupBackground = document.querySelector('.popupBackground');
const addContactForm = document.querySelector('.addContactForm');
const contactsList = document.querySelector('.contactsList');
const phoneNumbersBlock = document.querySelector('.phoneNumbersBlock');
const addNumber = document.querySelector('.addNumber');
const contactHTMLTemplate = document.querySelector('#contactTemplate').innerHTML; 
const birthdayAlertTemplate = document.querySelector('#birthdayAlertTemplate').innerHTML; 
const filterInput = document.querySelector('.filterInput'); 
const birthdayAlertsBlock = document.querySelector('.birthdayAlertsBlock');

const nameInput = document.querySelector('#name');
const surnameInput = document.querySelector('#surname');
const emailInput = document.querySelector('#email');
const dateOfBirthInput = document.querySelector('#dateOfBirth');
const numbersInput = document.getElementsByClassName('telephoneNumber');

// Константы
let contactsData = [];

// Обработчики событий
addContactButton.addEventListener('click', onAddContactButtonClick);
popupBackground.addEventListener('click', onPopupBackgroundClick);
addContactForm.addEventListener('submit', onAddContactFormSubmit);
addNumber.addEventListener('click', onAddNumberClick);
contactsList.addEventListener('click', onContactsListClick);
document.addEventListener('click', onDocumentClick);
filterInput.addEventListener('input', onFilterInputInput);

// Функции
init();

function init() {
    contactsData = validInit() ? validInit() : [];
    renderContactList();
    birthdayAlert();
};

function birthdayAlert() {
    const date = new Date();
    const day = date.getDate();
    let month = date.getMonth() + 1;
    if (month < 10) month = '0' + month;
    const today = month + '-' + day;
    const todayBirth = contactsData.filter(el => el.dateOfBirth.substring(5, el.dateOfBirth.length) == today);
    
    showBirthdaysAlerts(todayBirth);
    setTimeout(animeHide, 6500);
};

function showBirthdaysAlerts(todayBirth) {
    birthdayAlertsBlock.innerHTML = todayBirth.map(renderBirthdayAlert).join('\n');
    animeShow();
};

function animeShow() {
    anime({
        targets: birthdayAlertsBlock,
        opacity: 1,
        duration: 1500
    });
};

function animeHide() {
    anime({
        targets: birthdayAlertsBlock,
        opacity: 0,
        duration: 1500,
        complete: deleteBirthdayAlert
    });
};

function deleteBirthdayAlert() {
    birthdayAlertsBlock.remove();
};

function renderBirthdayAlert(el) {
    return birthdayAlertTemplate
        .replace('{{name}}', el.name)
        .replace('{{telephone}}', el.telephoneNumbers[0])
};

function validInit() {
    return JSON.parse(localStorage.getItem('contactsData'));
};

function renderContactList() {
    contactsList.innerHTML = contactsData.map(renderContact).join('\n');
};

function renderContact(el) {
    return contactHTMLTemplate
        .replace('{{id}}', el.id)
        .replace('{{name}}', el.name)
        .replace('{{surname}}', el.surname)
        .replace('{{email}}', el.email || '<span class="autoFilling">[No data]</span>')
        .replace('{{telephoneNumbers}}', el.telephoneNumbers[0])
        .replace('{{dateOfBirth}}', el.dateOfBirth)
        .replace('{{select}}', el.severalNumber === true ? '&#9660' : '');
};

function onFilterInputInput() {
    const filter = new RegExp('^' + filterInput.value,'gi');
    const filteredContact = contactsData.filter(el => el.name.match(filter));
    contactsList.innerHTML = filteredContact.map(el => renderContact(el)).join('\n');
};

function onDocumentClick(e) {
    if (!e.target.classList.contains('telephoneItem')) {
        hideAllNumberSelect(e);
    };

    animeHide();
};

function onAddNumberClick(e) {
    e.preventDefault();
    createNewNumberInput();
};

function createNewNumberInput() {
    const input = document.createElement('input');
    input.setAttribute('type', 'tel');
    input.setAttribute('placeholder', 'Additional number');

    input.className = 'eleven columns telephoneNumber addedTelephoneNumber';
    phoneNumbersBlock.append(input);
};

function onContactsListClick(e) {
    if (e.target.classList.contains('select')) {
        hideAllNumberSelect(e);
        showNumberSelect(e);
    } else if (e.target.classList.contains('deleteButton')) {
        deleteContact(e);
    } else if (e.target.classList.contains('editButton')) {
        showPopup();
        editContact(e);
    }
};

function editContact(e) {
    const editedContact = contactsData.find(el => el.id == e.target.parentNode.getAttribute('data-id'));
    idInput.value = editedContact.id;
    nameInput.value = editedContact.name;
    surnameInput.value = editedContact.surname;
    emailInput.value = editedContact.email;
    dateOfBirthInput.value = editedContact.dateOfBirth;
    createAddedInput(editedContact);
};

function editContactData() {
    const editedContactData = contactsData.find(el => el.id == idInput.value);

    editedContactData.name = nameInput.value;
    editedContactData.surname = surnameInput.value;
    editedContactData.email = emailInput.value;
    editedContactData.telephoneNumbers = getTelephoneNumber();
    editedContactData.dateOfBirth = dateOfBirthInput.value;
    editedContactData.severalNumber = editedContactData.telephoneNumbers.length > 1 ? editedContactData.severalNumber = true : editedContactData.severalNumber = false;

    updateContact(editedContactData);
    
};

function updateContact(editedContactData) {
    const editedContact = [...contactsList.children].find(el => el.getAttribute('data-id') == editedContactData.id);
    editedContact.innerHTML = renderContact(editedContactData); 
}

function createAddedInput(editedContact) {
    for(let i = 0; i < editedContact.telephoneNumbers.length - 1; i++) {
        createNewNumberInput(editedContact.telephoneNumbers[i]);
        
    };

    for(let i = 0; i < editedContact.telephoneNumbers.length; i++) {
        [...numbersInput][i].value = editedContact.telephoneNumbers[i];
    };
};

function hideAllNumberSelect(e) {
    const showedNumberSelect = document.getElementsByClassName('numberSelect');
    [...showedNumberSelect].forEach(el => {
        if (el.classList.contains('showNumberSelect') && el != e.target.nextElementSibling) {
            el.classList.remove('showNumberSelect');
        }
    });
};

function showNumberSelect(e) {
    const contact = contactsData.find(el => el.id == e.target.parentNode.parentNode.getAttribute('data-id'));
    const targetSelect = e.target.nextElementSibling;
    targetSelect.classList.toggle('showNumberSelect');
    targetSelect.innerHTML = contact.telephoneNumbers.map(renderNumberSelect).join('\n');
};

function deleteContact(e) {
    contactsData = contactsData.filter(el => el.id != e.target.parentNode.getAttribute('data-id'));
    setData();
    deleteContactItem(e);
};

function deleteContactItem(e) {
    e.target.parentNode.remove();
};

function renderNumberSelect(el) {
    return `<div class="telephoneItem">${el}</div>`
};

function onAddContactButtonClick() {
    showPopup();
};

function onAddContactFormSubmit(e) {
    e.preventDefault();

    if (validForm() && idInput.value === '') {
        addNewContact();
        hidePopup();
        clearAddedNumberInput();
        clearInputForm();
    } else if (validForm() && idInput.value !== '') {
        editContactData(e);
        setData();
        hidePopup();
        clearAddedNumberInput();
        clearInputForm();
    };
};

function validForm() {
    return [...numbersInput].every(el => el.value.slice() != '' && !isNaN(el.value)) &&
    nameInput.value != '' &&
    surnameInput.value != '' &&
    dateOfBirthInput.value != ''
};

function clearInputForm() {
    const inputForm = addContactForm.querySelectorAll('input');
    inputForm.forEach(el => el.value = '');
};

function clearAddedNumberInput() {
    const addedNumberInput = document.getElementsByClassName('addedTelephoneNumber');
    [...addedNumberInput].forEach(el => el.remove());
};

function addNewContact() {
    let contact = {};

    contact.id = Date.now();
    contact.name = nameInput.value;
    contact.surname = surnameInput.value;
    contact.email = emailInput.value;
    contact.telephoneNumbers = getTelephoneNumber();
    contact.dateOfBirth = dateOfBirthInput.value;
    contact.severalNumber = contact.telephoneNumbers.length > 1 ? contact.severalNumber = true : contact.severalNumber = false;

    contactsData.push(contact);

    setData();

    contactsList.innerHTML += renderContact(contact);
};

function setData() {
    localStorage.setItem('contactsData', JSON.stringify(contactsData));
};

function getTelephoneNumber() {
    const telephoneNumbers = [];
    [...numbersInput].forEach(el => telephoneNumbers.push(el.value));
    return telephoneNumbers;
};

function onPopupBackgroundClick(e) {
    if(e.target.classList.contains('popupBackground')) {
        hidePopup();
        clearAddedNumberInput();
        clearInputForm();
    }
};

function showPopup() {
    popupBackground.classList.add('showPopup');
};

function hidePopup() {
    popupBackground.classList.remove('showPopup');
};