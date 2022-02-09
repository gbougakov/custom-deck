const { widget } = figma;
const {
  useEffect,
  Text,
  AutoLayout,
  usePropertyMenu,
  useSyncedState,
  useWidgetId,
  Frame,
  SVG,
} = widget;

const colors = [
  { base: "#F24E1E", front: "#ff9a62", name: "Red" },
  { base: "#FFC700", front: "#ffd233", name: "Yellow" },
  { base: "#0FA958", front: "#4ecb71", name: "Green" },
  { base: "#699BF7", front: "#85b6ff", name: "Blue" },
  { base: "#9747FF", front: "#d99bff", name: "Violet" },
  { base: "#D27C2C", front: "#e4a951", name: "Brown" },
  { base: "#545454", front: "#cecccc", name: "Charcoal" },
  { base: "#F8F8F8", front: "#f8f8f8", name: "White" },
];

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function Widget() {
  const id = useWidgetId();

  useEffect(() => {
    figma.ui.onmessage = (msg) => {
      if (msg.type === "update-deck") {
        const deck = shuffle(msg.cards);
        setCards(deck);
        figma.notify(
          `Successfully replaced deck with ${msg.cards.length} cards`
        );
      }
      if (msg.type === "close") {
        figma.closePlugin();
      }
    };
  });

  const [color, setColor] = useSyncedState("color", "#545454");

  const [isDeck] = useSyncedState("isDeck", true);
  const [cards, setCards] = useSyncedState("cards", []);

  const [isFlipped, setFlipped] = useSyncedState("isFlipped", true);
  const [cardName] = useSyncedState("cardName", "");

  if (isDeck) {
    usePropertyMenu(
      [
        {
          itemType: "action",
          icon: `<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" color="#fff" stroke-linejoin="round" stroke-width="1" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"></path></svg>`,
          propertyName: "draw",
          tooltip: "Draw",
        },
        {
          itemType: "separator",
        },
        {
          itemType: "color-selector",
          propertyName: "color-selector",
          tooltip: "Color selector",
          selectedOption: color,
          options: colors.map((color) => ({
            tooltip: color.name,
            option: color.base,
          })),
        },
        {
          itemType: "action",
          propertyName: "swap",
          tooltip: "Swap deck",
        },
      ],
      async ({ propertyName, propertyValue }) => {
        if (propertyName === "color-selector") {
          setColor(propertyValue);
        } else if (propertyName === "draw") {
          if (cards.length === 0) {
            figma.notify("No cards to draw");
            return;
          }
          const node = (figma.getNodeById(id) as WidgetNode).cloneWidget({
            isDeck: false,
            cardName: cards[0],
          });

          node.x += 280;

          setCards(cards.slice(1));
        } else if (propertyName === "swap") {
          return new Promise(() => {
            figma.showUI(__html__, { width: 400, height: 120 });
          });
        }
      }
    );
  } else {
    usePropertyMenu(
      [
        {
          itemType: "action",
          icon: `<svg width="24" height="24" fill="none" stroke="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>`,
          propertyName: "flip",
          tooltip: "Flip card",
        },
        {
          itemType: "action",
          icon: `<svg width="24" height="24" fill="none" stroke="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`,
          propertyName: "peek",
          tooltip: "Peek",
        },
      ],
      ({ propertyName }) => {
        if (propertyName === "flip") {
          setFlipped(!isFlipped);
        } else if (propertyName === "peek") {
          figma.notify(cardName, { timeout: 2000 });
        }
      }
    );
  }

  if (isDeck) {
    if (cards.length === 0) {
      return (
        <AutoLayout
          width={250}
          height={350}
          padding={{ top: 16, left: 16, bottom: 16, right: 16 }}
          stroke={{ r: 0, g: 0, b: 0, a: 0.5 }}
          strokeWidth={2}
          cornerRadius={8}
          verticalAlignItems={"center"}
          horizontalAlignItems={"center"}
          direction={"vertical"}
          spacing={8}
        >
          <Text>Deck is empty</Text>
          <Text fontSize={12} width={200} horizontalAlignText={"center"}>
            Click on the deck and select "Swap deck"
          </Text>
        </AutoLayout>
      );
    } else {
      return (
        <Frame width={260} height={367} overflow={"visible"}>
          {[20, 15, 10, 5].map((offset) => (
            <Frame
              width={250}
              height={350}
              x={offset / 2}
              y={offset / 1.2}
              key={offset}
              fill={colors.find(({ base }) => base === color).base}
              cornerRadius={8}
              effect={[
                {
                  color: {
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 0.2,
                  },
                  type: "drop-shadow",
                  offset: { x: 2, y: 2 },
                  blur: 5,
                },
              ]}
            />
          ))}
          <AutoLayout
            width={250}
            height={350}
            padding={{ top: 16, left: 16, bottom: 16, right: 16 }}
            fill={colors.find(({ base }) => base === color).base}
            cornerRadius={8}
            horizontalAlignItems={"center"}
            verticalAlignItems={"center"}
            effect={[
              {
                color: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 0.2,
                },
                type: "drop-shadow",
                offset: { x: 2, y: 2 },
                blur: 5,
              },
            ]}
          >
            <SVG
              width={64}
              height={64}
              src={`<svg class="w-6 h-6" fill="none" stroke="rgba(0, 0, 0, 0.3)" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>`}
            />
          </AutoLayout>
        </Frame>
      );
    }
  } else {
    if (isFlipped) {
      return (
        <AutoLayout
          width={250}
          height={350}
          padding={{ top: 16, left: 16, bottom: 16, right: 16 }}
          fill={colors.find(({ base }) => base === color).base}
          cornerRadius={8}
          horizontalAlignItems={"center"}
          verticalAlignItems={"center"}
          effect={[
            {
              color: {
                r: 0,
                g: 0,
                b: 0,
                a: 0.2,
              },
              type: "drop-shadow",
              offset: { x: 2, y: 2 },
              blur: 5,
            },
          ]}
        >
          <SVG
            width={64}
            height={64}
            src={`<svg class="w-6 h-6" fill="none" stroke="rgba(0, 0, 0, 0.3)" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>`}
          />
        </AutoLayout>
      );
    } else {
      return (
        <AutoLayout
          width={250}
          height={350}
          padding={{ top: 16, left: 16, bottom: 16, right: 16 }}
          fill={colors.find(({ base }) => base === color).front}
          effect={[
            {
              color: {
                r: 0,
                g: 0,
                b: 0,
                a: 0.2,
              },
              type: "drop-shadow",
              offset: { x: 2, y: 2 },
              blur: 5,
            },
          ]}
          cornerRadius={8}
        >
          <Text width={218}>{cardName}</Text>
        </AutoLayout>
      );
    }
  }
}

widget.register(Widget);
