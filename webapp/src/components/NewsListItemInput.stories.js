import NewsListItemInput from "./NewsListItemInput.vue";

export default {
    title: 'NewsListItemInput',
    component: NewsListItemInput,
    argTypes: {
        create: {action: 'create'},
    }
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    components: {NewsListItemInput},
    template: '<NewsListItemInput v-bind="$props" @create="create" />'
});

export const Default = Template.bind({});
Default.args = {};
