import * as React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  findNodeHandle,
  UIManager,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  Provider as PaperProvider,
  Card,
  FAB,
  Menu,
  IconButton,
  Appbar,
  TouchableRipple,
} from "react-native-paper";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const Stack = createStackNavigator();

// Pastel color per level (now 8)
const LEVEL_COLORS = [
  "#ffd9db",
  "#d8edff",
  "#dff7d7",
  "#ffe9d1",
  "#f3e5f5",
  "#fff9c4",
  "#c8e6c9",
  "#bbdefb",
];
const CARD_COLORS = ["#ffe2e5", "#e3f1ff", "#e8f9e3", "#fff0df"];

const STORAGE_KEY = "BEE_NOTE_PROJECTS_V1";

function useProjects() {
  const [projects, setProjects] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setProjects(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  React.useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects)).catch(() => {});
  }, [projects]);

  const addOrUpdate = (proj) => {
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === proj.id);
      if (idx === -1) return [proj, ...prev];
      const copy = [...prev];
      copy[idx] = proj;
      return copy;
    });
  };

  return { projects, setProjects, addOrUpdate };
}

/* -------------------- HOME -------------------- */
function HomeScreen({ navigation }) {
  const { projects, addOrUpdate, setProjects } = useProjects();
  const [menuVisibleId, setMenuVisibleId] = React.useState(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const deleteProject = (id) => {
    Alert.alert("Delete Project", "Are you sure you want to delete this project?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setProjects((prev) => prev.filter((p) => p.id !== id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
      {/* Title Bar */}
      <View style={styles.homeHeader}>
        <Text style={styles.brand}>🐝 Bee Note</Text>
      </View>

      {/* Scrollable project list */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 90 }}>
        {projects.length === 0 ? (
          <Text style={{ textAlign: "center", color: "#888", marginTop: 40 }}>
            Tap + to create your first project.
          </Text>
        ) : (
          projects.map((item, index) => (
            <Card
              key={item.id}
              style={[
                styles.projectCard,
                { backgroundColor: CARD_COLORS[index % CARD_COLORS.length] },
              ]}
            >
              <TouchableRipple
                rippleColor="rgba(0,0,0,0.1)"
                onPress={() => navigation.navigate("Viewer", { project: item })}
                borderless={false}
                style={{ borderRadius: 22 }}
              >
                <Card.Title
                  title={item.title || "Untitled"}
                  titleVariant="titleMedium"
                  right={(props) => (
                    <Menu
                      visible={menuVisibleId === item.id}
                      onDismiss={() => setMenuVisibleId(null)}
                      anchor={
                        <IconButton
                          {...props}
                          icon="dots-vertical"
                          onPress={() => setMenuVisibleId(item.id)}
                        />
                      }
                    >
                      <Menu.Item
                        onPress={() => {
                          setMenuVisibleId(null);
                          deleteProject(item.id);
                        }}
                        title="Delete"
                        leadingIcon="delete"
                      />
                    </Menu>
                  )}
                />
              </TouchableRipple>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Floating + */}
      <FAB
        icon="plus"
        style={[styles.fab, { right: 25, bottom: 70 }]}
        onPress={() =>
          navigation.navigate("Editor", {
            onSave: (proj) => addOrUpdate(proj),
          })
        }
      />
    </SafeAreaView>
  );
}

/* -------------------- EDITOR -------------------- */
function EditorScreen({ navigation, route }) {
  const onSaveFromHome = route?.params?.onSave;
  const editingProject = route?.params?.project || null;
  const insets = useSafeAreaInsets();

  const [title, setTitle] = React.useState(editingProject?.title || "");
  const [boxes, setBoxes] = React.useState(
    editingProject?.boxes?.length
      ? editingProject.boxes
      : [
          {
            id: Date.now().toString(),
            text: "",
            level: 0,
            bold: false,
            italic: false,
            underline: false,
          },
        ]
  );
  const [activeId, setActiveId] = React.useState(boxes[0]?.id || null);

  const [menuVisible, setMenuVisible] = React.useState(false);

  const scrollRef = React.useRef(null);
  const inputRefs = React.useRef({});

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <Appbar.Header mode="small" elevated>
          <Appbar.Content
            title={editingProject ? "Edit Project" : "New Project"}
          />
          {activeId && (
            <Appbar.Action
              icon="delete"
              onPress={() => {
                deleteBox(activeId);
              }}
            />
          )}
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Appbar.Action
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                doSave();
              }}
              title="Save"
              leadingIcon="content-save"
            />
          </Menu>
        </Appbar.Header>
      ),
    });
  }, [navigation, menuVisible, title, boxes, activeId]);

  const doSave = () => {
    if (!title.trim()) {
      Alert.alert("No title", "Please add a title to save.");
      return;
    }
    const project = {
      id: editingProject?.id || String(Date.now()),
      title,
      boxes,
    };
    if (typeof onSaveFromHome === "function") onSaveFromHome(project);
    navigation.goBack();
  };

  const updateBox = (id, patch) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  };

  const addBox = () => {
    const idx = boxes.findIndex((b) => b.id === activeId);
    const level = idx >= 0 ? boxes[idx].level : 0;
    const newBox = {
      id: String(Date.now()),
      text: "",
      level,
      bold: false,
      italic: false,
      underline: false,
    };
    const copy = [...boxes];
    copy.splice(idx + 1, 0, newBox);
    setBoxes(copy);
    setActiveId(newBox.id);

    setTimeout(() => {
      inputRefs.current[newBox.id]?.focus();
    }, 100);
  };

  const changeIndent = (dir) => {
    setBoxes((prev) =>
      prev.map((b) =>
        b.id === activeId ? { ...b, level: Math.max(0, b.level + dir) } : b
      )
    );
  };

  const toggleStyle = (key) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === activeId ? { ...b, [key]: !b[key] } : b))
    );
  };

  const deleteBox = (id) => {
    setBoxes((prev) => prev.filter((b) => b.id !== id));
    if (activeId === id) {
      setActiveId(null);
    }
  };

  // ✅ Fix: Only run scroll logic on native platforms
  React.useEffect(() => {
    if (!activeId) return;
    if (Platform.OS === "web") return;

    const input = inputRefs.current[activeId];
    if (!input) return;
    const handle = findNodeHandle(input);
    if (!handle) return;
    UIManager.measureLayout(
      handle,
      findNodeHandle(scrollRef.current),
      () => {},
      (x, y) => {
        scrollRef.current?.scrollTo({ y: y - 100, animated: true });
      }
    );
  }, [activeId]);

  const renderBox = (item) => {
    const active = item.id === activeId;
    return (
      <TouchableRipple
        key={item.id}
        rippleColor="rgba(0,0,0,0.1)"
        onPress={() => setActiveId(item.id)}
        borderless={false}
        style={[
          styles.box,
          {
            backgroundColor: LEVEL_COLORS[item.level % LEVEL_COLORS.length],
            marginLeft: 16 + item.level * 24,
          },
          active && {
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 2,
            borderWidth: 2,
            borderColor: "#f59e0b",
          },
        ]}
      >
        <TextInput
          ref={(r) => (inputRefs.current[item.id] = r)}
          placeholder="Type here…"
          value={item.text}
          onChangeText={(t) => updateBox(item.id, { text: t })}
          multiline
          style={[
            styles.boxInput,
            item.bold && { fontWeight: "700" },
            item.italic && { fontStyle: "italic" },
            item.underline && { textDecorationLine: "underline" },
          ]}
          onFocus={() => setActiveId(item.id)}
        />
      </TouchableRipple>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top + 64}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          onTouchStart={() => {
            setActiveId(null);
          }}
        >
          {/* Title line */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Project title…"
              style={styles.titleInput}
            />
          </View>

          {/* Boxes list */}
          <View style={{ padding: 16 }}>
            {boxes.map((b) => renderBox(b))}
          </View>
        </ScrollView>

        {/* Toolbar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={insets.bottom}
        >
          <View
            style={[
              styles.toolbar,
              { paddingBottom: Math.max(insets.bottom, 8) },
            ]}
          >
            <IconButton
              icon="format-bold"
              onPress={() => toggleStyle("bold")}
            />
            <IconButton
              icon="format-italic"
              onPress={() => toggleStyle("italic")}
            />
            <IconButton
              icon="format-underline"
              onPress={() => toggleStyle("underline")}
            />
            <IconButton
              icon="format-indent-decrease"
              onPress={() => changeIndent(-1)}
            />
            <IconButton
              icon="format-indent-increase"
              onPress={() => changeIndent(1)}
            />
            <IconButton icon="plus" onPress={addBox} />
          </View>
        </KeyboardAvoidingView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* -------------------- VIEWER -------------------- */
function ViewerScreen({ route, navigation }) {
  const { project } = route.params;
  const [expandedIds, setExpandedIds] = React.useState(new Set());

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: project.title || "View",
    });
  }, [navigation, project.title]);

  const visible = React.useMemo(() => {
    const out = [];
    const openAtLevel = [];
    for (let i = 0; i < project.boxes.length; i++) {
      const box = project.boxes[i];
      const lvl = box.level;
      openAtLevel.length = lvl;
      const parentOpen = openAtLevel.every(Boolean);
      const isRoot = lvl === 0;

      if (isRoot || parentOpen) {
        out.push(box);
      } else {
        continue;
      }

      const hasChildren = project.boxes[i + 1]?.level > lvl;
      const isExpanded = expandedIds.has(box.id);
      openAtLevel[lvl] = hasChildren && isExpanded;
    }
    return out;
  }, [project.boxes, expandedIds]);

  const onToggle = (box) => {
    const idxAll = project.boxes.findIndex((b) => b.id === box.id);
    const hasChildren = project.boxes[idxAll + 1]?.level > box.level;
    if (!hasChildren) return;
    const next = new Set(expandedIds);
    if (next.has(box.id)) next.delete(box.id);
    else next.add(box.id);
    setExpandedIds(next);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {visible.length === 0 ? (
          <Text style={{ textAlign: "center", color: "#888" }}>No content.</Text>
        ) : (
          visible.map((item) => (
            <TouchableRipple
              key={item.id}
              rippleColor="rgba(0,0,0,0.1)"
              onPress={() => onToggle(item)}
              borderless={false}
              style={[
                styles.box,
                {
                  backgroundColor:
                    LEVEL_COLORS[item.level % LEVEL_COLORS.length],
                  marginLeft: 16 + item.level * 24,
                },
              ]}
            >
              <Text
                style={[
                  styles.boxText,
                  item.bold && { fontWeight: "700" },
                  item.italic && { fontStyle: "italic" },
                  item.underline && { textDecorationLine: "underline" },
                ]}
              >
                {item.text || "(empty)"}
              </Text>
            </TouchableRipple>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------- ROOT APP -------------------- */
export default function Root() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Editor" component={EditorScreen} />
            <Stack.Screen name="Viewer" component={ViewerScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  homeHeader: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e6e6e6",
    backgroundColor: "#fff",
  },
  brand: {
    fontSize: 20,
    fontWeight: "800",
  },
  projectCard: {
    borderRadius: 22,
    marginBottom: 12,
  },
  fab: {
    position: "absolute",
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "700",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  box: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 6,
  },
  boxInput: {
    minHeight: 28,
    fontSize: 16,
  },
  boxText: {
    fontSize: 16,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    backgroundColor: "#f3f4f6",
  },
});
