<template>
  <v-container>
    <v-row>
      <div style="display:flex; align-items:center; gap:8px;">
        <h2>Учетные записи</h2>
        <v-btn variant="outlined" @click="store.addAccount" class="button-plus">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
    </v-row>

    <div style="background:rgba(161,206,255,0.2);">
      <v-icon icon="mdi-help-circle-outline" size="large"
        v-tooltip="'Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;'" />
      Для указания нескольких меток используйте разделитель ;
    </div>

    <v-row v-if="$vuetify.display.smAndUp" class="header">
      <v-col cols="3" sm="2" md="2">Метки</v-col>
      <v-col cols="3" sm="3" md="3">Тип записи</v-col>
      <v-col cols="3" sm="3" md="3">Логин</v-col>
      <v-col cols="3" md="3">Пароль</v-col>
      <v-col col></v-col>
    </v-row>

    <div v-for="(account, index) in store.accounts" :key="index">

      <div v-if="$vuetify.display.xs">
        <div class="pa-4">
          <div class="d-flex justify-space-between align-center mb-3">
            <span class="text-overline">Учётная запись #{{ index + 1 }}</span>
            <v-btn @click="store.removeAccount(index)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>

          <div class="mb-3">
            <div class="text-overline mb-1">Метки</div>
            <v-text-field v-model="labelStrings[index]" :rules="[rules.label]" @blur="updateLabels(index)" />
          </div>

          <div class="mb-3">
            <div class="text-overline mb-1">Тип записи</div>
            <v-select v-model="account.type" :items="typeItems" item-title="title" item-value="value"
              @update:model-value="handleTypeChange(index)" />
          </div>

          <div class="mb-3">
            <div class="text-overline mb-1">Логин</div>
            <v-text-field v-model="account.login" :rules="[rules.required, rules.login]" @blur="updateLogin(index)" />
          </div>

          <div v-if="account.type !== 'LDAP'" class="mb-3">
            <div class="text-overline mb-1">Пароль</div>
            <v-text-field v-model="account.password" :type="passwordVisible[index] ? 'text' : 'password'"
              :append-inner-icon="passwordVisible[index] ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="togglePasswordVisibility(index)" :rules="[rules.required, rules.password]"
              @blur="updatePassword(index)" />
          </div>
        </div>
      </div>

      <v-row v-else class="align-center">
        <v-col cols="3" sm="2" md="2" lg="2" xl="2">
          <v-text-field v-model="labelStrings[index]" :rules="[rules.label]" @blur="updateLabels(index)" />
        </v-col>

        <v-col cols="3" sm="3" md="3" lg="3" xl="3">
          <v-select v-model="account.type" :items="typeItems" item-title="title" item-value="value"
            @update:model-value="handleTypeChange(index)" />
        </v-col>

        <v-col :cols="account.type === 'LDAP' ? 5 : 3" :sm="account.type === 'LDAP' ? 6 : 3"
          :md="account.type === 'LDAP' ? 6 : 3" :lg="account.type === 'LDAP' ? 6 : 3"
          :xl="account.type === 'LDAP' ? 6 : 3">
          <v-text-field v-model="account.login" :rules="[rules.required, rules.login]" @blur="updateLogin(index)" />
        </v-col>

        <v-col v-if="account.type !== 'LDAP'" :cols="account.type === 'LDAP' ? 1 : 2"
          :sm="account.type === 'LDAP' ? 1 : 3" :md="account.type === 'LDAP' ? 1 : 3" lg="3" xl="3">
          <v-text-field v-model="account.password" :type="passwordVisible[index] ? 'text' : 'password'"
            variant="outlined" :append-inner-icon="passwordVisible[index] ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="togglePasswordVisibility(index)" :rules="[rules.required, rules.password]"
            @blur="updatePassword(index)" />
        </v-col>

        <v-col col sm="1" md="1" lg="1" xl="auto">
          <v-btn size="small" @click="store.removeAccount(index)" class="button-delete">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useAccountsStore } from '@/stores/accountsStore';
import { ref, watch } from 'vue';
import rules from '@/model/inputRules';

const store = useAccountsStore();

const labelStrings = ref<string[]>([]);
const passwordVisible = ref<boolean[]>([]);

watch(
  () => store.accounts,
  (accounts) => {
    labelStrings.value = accounts.map(acc =>
      acc.labels.map(l => l.text).join(';')
    );
    passwordVisible.value = accounts.map(() => false);
  },
  { immediate: true }
);

const typeItems = [
  { value: 'Local', title: 'Локальная' },
  { value: 'LDAP', title: 'LDAP' },
];

const updateLabels = (index: number) => {
  const value = (labelStrings.value[index] || '').trim();
  if (value.length > 50) return;

  const labels = value
    .split(';')
    .map(t => t.trim())
    .filter(Boolean)
    .map(text => ({ text }));

  store.updateAccount(index, { labels });
};

const updateLogin = (index: number) => {
  const login = store.accounts[index]!.login?.trim();
  if (!login || login.length > 100) return;
  store.updateAccount(index, { login });
};

const updatePassword = (index: number) => {
  const password = store.accounts[index]!.password;
  if (store.accounts[index]!.type === 'Local' && (!password || password.length > 100)) {
    return;
  }
  store.updateAccount(index, { password });
};

const handleTypeChange = (index: number) => {
  if (store.accounts[index]!.type === 'LDAP') {
    store.updateAccount(index, { password: null });
  }
};

const togglePasswordVisibility = (index: number) => {
  passwordVisible.value[index] = !passwordVisible.value[index];
};
</script>

<style>
.v-row {
  margin: 0 !important;
}

.button-plus {
  height: 60px !important;
  border-color: rgba(161, 206, 255, 1) !important;
  border-radius: 3px;
}

.button-delete {
  height: calc(var(--v-btn-height) + 20px) !important;
}
</style>