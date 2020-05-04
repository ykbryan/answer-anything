# AWS Amplify for Mobile and Web App

## Navigation and routing

R: https://reacttraining.com/react-router/web/guides/quick-start

RN: https://reactnavigation.org/docs/hello-react-navigation

## UI libraries

R: https://react-bootstrap.github.io/components/alerts/

RN: https://docs.nativebase.io/Components.html#Components

## Amplify

https://aws.amazon.com/blogs/mobile/graphql-security-appsync-amplify/

## Folder Structure

- amplify: AWS configurations
- react-native: mobile app
- react: web app
- src: auto-generated files by Amplify CLI

## Troubleshootings

if `zen-observable` is missing and you see an error regarding it

```
yarn add zen-observable
```

Make sure you are using node 13, not 8 or 14. Use `nvm` to select the right version.

```
nvm use 13
```

Make sure you are using the right amplify version

```
amplify version
```
