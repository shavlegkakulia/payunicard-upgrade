import { StyleSheet } from "react-native";
import colors from "../../constants/colors";

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  background: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    elevation:0,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    borderWidth: 0,
    width: "100%"
  },
  container: {
    backgroundColor: colors.white,
    width: "100%",
    height: 0,
    //overflow: "hidden",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10
  },
  draggableContainer: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    position: 'absolute',
    top: 25,
    left: 0,
    right: 0
  },
  innerDragableIcon: {
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
  },
  draggableIcon: {
    width: 40,
    height: 6,
    borderRadius: 3
  },
  buttonText: {
    color: colors.black
  },
  cancellButton: {
    color: colors.danger,
  },
  buttonContainer: {
    marginBottom: 2,
    marginTop: 2,
    height: 40,
    backgroundColor: colors.white,
    flex: 1,
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  fixedView: {
    flex: 1
}
});

export default styles;