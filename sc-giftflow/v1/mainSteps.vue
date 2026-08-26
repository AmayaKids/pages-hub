<template>
  <div class="features">
    <div class="feature">
      <svg class="feature__icon" width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.25 10.5C9.183 10.5 10.75 8.933 10.75 7C10.75 5.067 9.183 3.5 7.25 3.5C5.317 3.5 3.75 5.067 3.75 7C3.75 8.933 5.317 10.5 7.25 10.5Z" fill="currentColor"/>
      </svg>

      <div class="feature__name">{{ $t('basic.cars_task_1') }}</div>
    </div>

    <div class="feature">
      <svg class="feature__icon" width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.25 10.5C9.183 10.5 10.75 8.933 10.75 7C10.75 5.067 9.183 3.5 7.25 3.5C5.317 3.5 3.75 5.067 3.75 7C3.75 8.933 5.317 10.5 7.25 10.5Z" fill="currentColor"/>
      </svg>

      <div class="feature__name">{{ $t('basic.cars_task_2') }}</div>
    </div>

    <div class="feature">
      <svg class="feature__icon" width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.25 10.5C9.183 10.5 10.75 8.933 10.75 7C10.75 5.067 9.183 3.5 7.25 3.5C5.317 3.5 3.75 5.067 3.75 7C3.75 8.933 5.317 10.5 7.25 10.5Z" fill="currentColor"/>
      </svg>

      <div class="feature__name">{{ $t('basic.cars_task_3') }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.features {
  position: relative;
  // height: 3.625rem;
  // min-height: 3.625rem;
  // max-height: 3.625rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-color: var(--white-100);
  color: var(--gray-50);

  >:not(:last-child) {
    margin-bottom: .25rem;
  }
  
  .feature {
    display: flex;
    // align-items: center;
    justify-content: center;

    &__icon {
      width: .75rem;
      height: .75rem;
      color: var(--color-orange-80);
    }

    &__name {
      font-size: .875rem;
      font-weight: 400;
      line-height: 1.125rem;
      color: var(--gray-90);
      flex: 1;
    }

    >:not(:last-child) {
      margin-right: .25rem;
    }
  }

  &--selected {
    color: var(--orange-80);
  }

  &--extra {
    &.features--selected {
      color: var(--purple-60);
    }
  }
}

@media (min-width: 1024px) {
  .features {
    // height: 7.5rem;
    // min-height: 7.5rem;
    // max-height: 7.5rem;

    >:not(:last-child) {
      margin-bottom: .75rem;
    }
  
    .feature {
      &__icon {
        width: 2rem;
        height: 2rem;
      }

      &__name {
        font-size: 1.5rem;
        font-weight: 400;
        line-height: 2rem;
      }

      >:not(:last-child) {
        margin-right: .25rem;
      }
    }
  }
}
</style>
