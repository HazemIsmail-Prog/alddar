<template>
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>
      Oops! The page you're looking for doesn't exist.
    </p>
    <router-link to="/">Go back to Home</router-link>
  </div>
</template>

<script setup lang="ts">
// No script logic required for the Not Found page
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
}

.not-found h1 {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.not-found p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
}

.not-found a {
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  border: 1px solid #42b983;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.not-found a:hover {
  background-color: #42b983;
  color: #fff;
}
</style>