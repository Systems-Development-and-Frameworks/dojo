import App from "./index.vue";

App.apollo = null
App.props.posts = []

export default {
    title: 'App',
    component: App,
    argTypes: {
        posts: {control: 'object'}
    }
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    components: {App},
    template: '<App v-bind="$props"/>'
});

export const Default = Template.bind({});
Default.args = {
    posts: []
};

export const EmptyNewsList = Template.bind({});
EmptyNewsList.args = {
    posts: []
};

export const AscendingOrderedNewsList = Template.bind({});
AscendingOrderedNewsList.args = {
    initialDescendingOrder: false,
    posts: [
        {id: "0", title: "macOS", votes: 3, author: "1"},
        {id: "1", title: "Linux", votes: 2, author: "1"},
        {id: "2", title: "Windows", votes: 1, author: "1"}
    ]
};

export const DescendingOrderedNewsList = Template.bind({});
DescendingOrderedNewsList.args = {
    initialDescendingOrder: true,
    posts: [
        {id: "0", title: "macOS", votes: 3, author: "1"},
        {id: "1", title: "Linux", votes: 2, author: "1"},
        {id: "2", title: "Windows", votes: 1, author: "1"}
    ]
};
