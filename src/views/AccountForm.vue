<template>
  <v-container>
    <v-row>
      <v-col>
        <div style="display:flex; align-items:center; gap:8px;">
          <h2>Учетные записи</h2>
          <v-btn @click="addAccount">
            <v-icon icon="mdi-plus" />
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <p style="background-color: rgb(161, 206, 255, 0.2);">
      <v-icon icon="mdi-help-circle-outline" size="large"
        v-tooltip="'Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;'" />
      Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
    </p>
    <v-row class="header">
      <v-col cols="3">Метки</v-col>
      <v-col cols="3">Тип записи</v-col>
      <v-col cols="3">Логин</v-col>
      <v-col cols="3">Пароль</v-col>
      <v-col cols="auto"></v-col>
    </v-row>
    <v-row v-for="(account, index) in accounts" :key="index">
      <v-col cols="3">
        <v-text-field v-model="labelStrings[index]" density="compact" hide-details="auto" :rules="labelRules"
          @blur="updateLabels(index)" />
      </v-col>
      <v-col cols="3">
        <v-select v-model="account.type" :items="typeItems" item-title="title" item-value="value" density="compact"
          hide-details="auto" @update:model-value="handleTypeChange(index)" />
      </v-col>
      <v-col :cols="account.type === 'LDAP' ? 4 : 2">
        <v-text-field v-model="account.login" density="compact" hide-details="auto" :rules="loginRules" />
      </v-col>
      <v-col :cols="account.type === ('LDAP' as string) ? 1 : 2" v-if="account.type !== ('LDAP' as string)">
        <v-text-field v-if="account.type === 'Local'" v-model="account.password"
          :type="passwordVisible[index] ? 'text' : 'password'" density="compact" placeholder="Enter your password"
          variant="outlined" :append-inner-icon="passwordVisible[index] ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="togglePasswordVisibility(index)" :rules="passwordRules" />
      </v-col>
      <v-col cols="auto">
        <v-btn @click="removeAccount(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">

import { useAccountsStore } from '../stores/accountsStore';
import { computed, ref, watch } from 'vue';

const store = useAccountsStore();
const accounts = computed(() => store.accounts);
const labelStrings = ref<string[]>(accounts.value.map(acc => acc.labels.map(l => l.text).join(';')));
const passwordVisible = ref<boolean[]>(accounts.value.map((visible) => !visible));

watch(accounts, () => {
  labelStrings.value = accounts.value.map(acc => acc.labels.map(l => l.text).join(';'));
}, { deep: true });

const typeItems = [
  { value: 'Local', title: 'Локальная' },
  { value: 'LDAP', title: 'LDAP' },
];

const labelRules = [
  (v: string) => v.length <= 50 || 'Макс. 50 символов',
];

const loginRules = [
  (v: string) => !!v || 'Логин обязателен',
  (v: string) => v.length <= 100 || 'Макс. 100 символов',
];

const passwordRules = [
  (v: string) => !!v || 'Пароль обязателен',
  (v: string) => v.length <= 100 || 'Макс. 100 символов',
];


const addAccount = () => {
  store.addAccount();
  labelStrings.value.push('');
}

const removeAccount = (index: number) => {
  store.removeAccount(index);
  labelStrings.value.splice(index, 1);
}

const updateLabels = (index: number) => {
  const labels = labelStrings.value[index]!
    .split(';')
    .map(text => text.trim())
    .filter(text => text !== '')
    .map(text => ({ text }));
  store.updateAccount(index, { labels });
}

const handleTypeChange = (index: number) => {
  if (accounts.value[index]!.type === 'LDAP') {
    store.updateAccount(index, { password: null });
  }
}

const togglePasswordVisibility = (index: number) => {
  passwordVisible.value[index] = !passwordVisible.value[index];
}
</script>
