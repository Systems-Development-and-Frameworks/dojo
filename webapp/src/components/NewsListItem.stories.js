import NewsListItem from "./NewsListItem.vue";

export default {
    title: 'NewsListItem',
    component: NewsListItem,
    argTypes: {
        upvote: {action: 'upvote'},
        downvote: {action: 'downvote'},
        remove: {action: 'remove'},
    }
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    components: {NewsListItem},
    template: `
      <NewsListItem
          v-bind="$props"
          @upvote="upvote"
          @downvote="downvote"
          @remove="remove"
      />
    `
});

export const Default = Template.bind({});
Default.args = {
    title: "A normal news item",
    votes: 0,
};

export const PositiveScore = Template.bind({});
PositiveScore.args = {
    title: "Positive Score NewsListItem",
    votes: 4,
};

export const NegativeScore = Template.bind({});
NegativeScore.args = {
    title: "Negative Score NewsListItem",
    votes: -2,
};