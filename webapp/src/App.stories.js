import App from "./App.vue";

export default {
    title: 'App',
    component: App,
    argTypes: {
        initialNewsListItems: {control: 'object'}
    }
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    components: {App},
    template: '<App v-bind="$props"/>'
});

export const Default = Template.bind({});
Default.args = {};

export const EmptyNewsList = Template.bind({});
EmptyNewsList.args = {
    initialNewsListItems: []
};

export const AscendingOrderedNewsList = Template.bind({});
AscendingOrderedNewsList.args = {
    initialDescendingOrder: false,
    initialNewsListItems: [
        {id: 0, title: "macOS", votes: 3},
        {id: 1, title: "Linux", votes: 2},
        {id: 2, title: "Windows", votes: 1}
    ]
};

export const DescendingOrderedNewsList = Template.bind({});
DescendingOrderedNewsList.args = {
    initialDescendingOrder: true,
    initialNewsListItems: [
        {id: 0, title: "macOS", votes: 3},
        {id: 1, title: "Linux", votes: 2},
        {id: 2, title: "Windows", votes: 1}
    ]
};
