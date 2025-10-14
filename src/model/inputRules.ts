export default {
  required: (v: string) => !!v?.trim() || 'Обязательное поле',

  login: (v: string) => (v && v.length <= 100) || 'Максимальная длина 100 символов',

  label: (v: string) => (v && v.length >= 50) ? 'Максимальная длина 50 символов' : true,

  password: (v: string) => (v && v.length <= 100) || 'Максимальная длина 100 символов',
};